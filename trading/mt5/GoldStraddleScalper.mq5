//+------------------------------------------------------------------+
//|                                          GoldStraddleScalper.mq5 |
//|      Trailing stop-and-reverse straddle scalper for XAUUSD (M1)  |
//|                                                                  |
//| Logic (mirrors the reference video):                             |
//|  - When flat, bracket price with a BUY STOP above and a          |
//|    SELL STOP below, both at distance D.                          |
//|  - When one side fills, the opposite stop order stays behind     |
//|    price as combined stop-loss + reversal entry, and trails      |
//|    the position as it moves into profit.                         |
//|  - Hitting that order closes the trade and opens the reverse     |
//|    in the same moment: small capped losses, winners run on       |
//|    the trail.                                                    |
//|                                                                  |
//| Small-account protection:                                        |
//|  - Risk-% position sizing (never a fixed big lot), hard SL on    |
//|    every position, daily equity loss halt, loss-streak           |
//|    cooldown, session filter (flat outside hours), spread         |
//|    filter. Volume never escalates - no martingale, ever.         |
//|                                                                  |
//| Safe on both hedging and netting accounts.                       |
//| Attach to: XAUUSD, M1.                                           |
//+------------------------------------------------------------------+
#property copyright "kendesigners-studio"
#property version   "1.00"

#include <Trade\Trade.mqh>

//--- inputs -------------------------------------------------------
input group "Core strategy"
input long    InpMagic            = 418418;  // Magic number
input double  InpFixedLots        = 0.0;     // Fixed lots (0 = size from risk %)
input double  InpRiskPercent      = 0.5;     // Risk per flip (% of balance)
input double  InpMaxLots          = 0.50;    // Hard lot cap
input bool    InpUseATRDistance   = true;    // Bracket distance from ATR
input int     InpATRPeriod        = 14;      // ATR period (chart timeframe)
input double  InpATRMultiplier    = 2.0;     // Distance = ATR x this
input double  InpMinDistancePts   = 200;     // Min bracket distance (points)
input double  InpMaxDistancePts   = 600;     // Max bracket distance (points)
input double  InpFixedDistancePts = 300;     // Bracket distance if ATR off (points)
input double  InpTrailStepPts     = 30;      // Min improvement before re-trailing (points)
input double  InpRewardMultiple   = 0.0;     // TP = distance x this (0 = trail only, like the video)

input group "Small-account protection"
input double  InpMaxDailyLossPct  = 3.0;     // Daily equity loss % -> flat + halt for the day
input int     InpMaxConsecLosses  = 3;       // Losing flips in a row -> cooldown
input int     InpCooldownMinutes  = 30;      // Cooldown length (minutes)
input double  InpMaxSpreadPts     = 45;      // Max spread to start a new cycle (points)

input group "Session filter (server time)"
input bool    InpUseSession       = true;    // Trade only inside session, flat outside
input int     InpStartHour        = 8;       // Session start hour
input int     InpEndHour          = 21;      // Session end hour

//--- state --------------------------------------------------------
CTrade   g_trade;
int      g_atr             = INVALID_HANDLE;
int      g_consecLosses    = 0;
datetime g_cooldownUntil   = 0;
int      g_day             = -1;
double   g_dayStartBalance = 0.0;
bool     g_haltedToday     = false;

//+------------------------------------------------------------------+
int OnInit()
  {
   g_trade.SetExpertMagicNumber((ulong)InpMagic);
   g_trade.SetTypeFillingBySymbol(_Symbol);
   g_trade.SetDeviationInPoints(30);

   if(InpUseATRDistance)
     {
      g_atr = iATR(_Symbol, _Period, InpATRPeriod);
      if(g_atr == INVALID_HANDLE)
        {
         Print("GoldStraddleScalper: failed to create ATR handle");
         return INIT_FAILED;
        }
     }
   return INIT_SUCCEEDED;
  }

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   if(g_atr != INVALID_HANDLE)
      IndicatorRelease(g_atr);
  }

//+------------------------------------------------------------------+
void OnTick()
  {
   UpdateDay();

   if(!g_haltedToday && DailyLossBreached())
     {
      g_haltedToday = true;
      Print("GoldStraddleScalper: daily loss cap hit - flat until next day");
     }

   bool blocked = g_haltedToday
               || TimeCurrent() < g_cooldownUntil
               || !SessionOpen();
   if(blocked)
     {
      CloseEverything();
      return;
     }

   MqlTick tick;
   if(!SymbolInfoTick(_Symbol, tick))
      return;
   if(tick.ask <= 0.0 || tick.bid <= 0.0)
      return;

   ulong posTickets[];
   int nPos = MyPositions(posTickets);

   ulong buyStopT = 0, sellStopT = 0;
   int nPend = MyPendings(buyStopT, sellStopT);

   // transient state right after a flip on a hedging account:
   // the reversal filled while the old position was still open.
   if(nPos >= 2)
     {
      CloseOldestPosition(posTickets, nPos);
      return;
     }

   double D = BracketDistancePrice(tick);
   if(D <= 0.0)
      return;

   if(nPos == 0)
     {
      double spreadPts = (tick.ask - tick.bid) / _Point;
      if(nPend == 2)
        {
         RecenterStraddle(tick, D, buyStopT, sellStopT, spreadPts);
         return;
        }
      if(nPend == 1)              // half a straddle left over - rebuild cleanly
        {
         CloseEverything();
         return;
        }
      if(spreadPts <= InpMaxSpreadPts)
         PlaceStraddle(tick, D);
      return;
     }

   ManagePosition(posTickets[0], tick, D, buyStopT, sellStopT);
  }

//+------------------------------------------------------------------+
//| Track flip results for the loss-streak cooldown                  |
//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction &trans,
                        const MqlTradeRequest &request,
                        const MqlTradeResult &result)
  {
   if(trans.type != TRADE_TRANSACTION_DEAL_ADD)
      return;
   if(!HistoryDealSelect(trans.deal))
      return;
   if(HistoryDealGetInteger(trans.deal, DEAL_MAGIC) != InpMagic)
      return;
   if(HistoryDealGetString(trans.deal, DEAL_SYMBOL) != _Symbol)
      return;

   long entry = HistoryDealGetInteger(trans.deal, DEAL_ENTRY);
   if(entry != DEAL_ENTRY_OUT && entry != DEAL_ENTRY_INOUT)
      return;

   double pl = HistoryDealGetDouble(trans.deal, DEAL_PROFIT)
             + HistoryDealGetDouble(trans.deal, DEAL_SWAP)
             + HistoryDealGetDouble(trans.deal, DEAL_COMMISSION);

   if(pl < 0.0)
     {
      g_consecLosses++;
      if(g_consecLosses >= InpMaxConsecLosses)
        {
         g_cooldownUntil = TimeCurrent() + InpCooldownMinutes * 60;
         g_consecLosses  = 0;
         PrintFormat("GoldStraddleScalper: %d losing flips in a row - cooling down until %s",
                     InpMaxConsecLosses, TimeToString(g_cooldownUntil));
        }
     }
   else if(pl > 0.0)
      g_consecLosses = 0;
  }

//+------------------------------------------------------------------+
//| Bracket / trail distance in price units                          |
//+------------------------------------------------------------------+
double BracketDistancePrice(const MqlTick &tick)
  {
   double pts;
   if(InpUseATRDistance && g_atr != INVALID_HANDLE)
     {
      double buf[1];
      if(CopyBuffer(g_atr, 0, 1, 1, buf) == 1 && buf[0] > 0.0)
         pts = buf[0] / _Point * InpATRMultiplier;
      else
         pts = InpFixedDistancePts;
      pts = MathMax(InpMinDistancePts, MathMin(InpMaxDistancePts, pts));
     }
   else
      pts = InpFixedDistancePts;

   // never violate the broker's minimum stop distance
   long   stopsLevel = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   double spreadPts  = (tick.ask - tick.bid) / _Point;
   pts = MathMax(pts, (double)stopsLevel + spreadPts + 10.0);

   return pts * _Point;
  }

//+------------------------------------------------------------------+
//| Position sizing: fixed % of balance risked per flip              |
//+------------------------------------------------------------------+
double CalcLots(double distPrice)
  {
   if(InpFixedLots > 0.0)
      return NormalizeVolume(MathMin(InpFixedLots, InpMaxLots));

   double tickSize = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   double tickVal  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   if(tickSize <= 0.0 || tickVal <= 0.0 || distPrice <= 0.0)
      return 0.0;

   double lossPerLot = distPrice / tickSize * tickVal;
   if(lossPerLot <= 0.0)
      return 0.0;

   double riskMoney = AccountInfoDouble(ACCOUNT_BALANCE) * InpRiskPercent / 100.0;
   return NormalizeVolume(MathMin(riskMoney / lossPerLot, InpMaxLots));
  }

//+------------------------------------------------------------------+
double NormalizeVolume(double v)
  {
   double vmin  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double vmax  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double vstep = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   if(vstep > 0.0)
      v = MathFloor(v / vstep + 1e-8) * vstep;
   return MathMax(vmin, MathMin(vmax, v));
  }

//+------------------------------------------------------------------+
double RoundPrice(double p)
  {
   double ts = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   if(ts > 0.0)
      p = MathRound(p / ts) * ts;
   return NormalizeDouble(p, _Digits);
  }

//+------------------------------------------------------------------+
bool SessionOpen()
  {
   if(!InpUseSession)
      return true;
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   if(InpStartHour == InpEndHour)
      return true;
   if(InpStartHour < InpEndHour)
      return (dt.hour >= InpStartHour && dt.hour < InpEndHour);
   return (dt.hour >= InpStartHour || dt.hour < InpEndHour);   // overnight session
  }

//+------------------------------------------------------------------+
void UpdateDay()
  {
   MqlDateTime dt;
   TimeToStruct(TimeCurrent(), dt);
   int d = dt.year * 1000 + dt.day_of_year;
   if(d != g_day)
     {
      g_day             = d;
      g_dayStartBalance = AccountInfoDouble(ACCOUNT_BALANCE);
      g_haltedToday     = false;
     }
  }

//+------------------------------------------------------------------+
bool DailyLossBreached()
  {
   if(g_dayStartBalance <= 0.0)
      return false;
   double equity = AccountInfoDouble(ACCOUNT_EQUITY);
   return (g_dayStartBalance - equity) >= g_dayStartBalance * InpMaxDailyLossPct / 100.0;
  }

//+------------------------------------------------------------------+
int MyPositions(ulong &tickets[])
  {
   ArrayResize(tickets, 0);
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong t = PositionGetTicket(i);
      if(t == 0)
         continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol)
         continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic)
         continue;
      int n = ArraySize(tickets);
      ArrayResize(tickets, n + 1);
      tickets[n] = t;
     }
   return ArraySize(tickets);
  }

//+------------------------------------------------------------------+
int MyPendings(ulong &buyStop, ulong &sellStop)
  {
   buyStop  = 0;
   sellStop = 0;
   int n = 0;
   for(int i = OrdersTotal() - 1; i >= 0; i--)
     {
      ulong t = OrderGetTicket(i);
      if(t == 0)
         continue;
      if(OrderGetString(ORDER_SYMBOL) != _Symbol)
         continue;
      if(OrderGetInteger(ORDER_MAGIC) != InpMagic)
         continue;
      long type = OrderGetInteger(ORDER_TYPE);
      if(type == ORDER_TYPE_BUY_STOP)
        {
         buyStop = t;
         n++;
        }
      else if(type == ORDER_TYPE_SELL_STOP)
        {
         sellStop = t;
         n++;
        }
     }
   return n;
  }

//+------------------------------------------------------------------+
void CloseOldestPosition(ulong &tickets[], int n)
  {
   ulong oldest    = 0;
   long  oldestTms = LONG_MAX;
   for(int i = 0; i < n; i++)
      if(PositionSelectByTicket(tickets[i]))
        {
         long tms = PositionGetInteger(POSITION_TIME_MSC);
         if(tms < oldestTms)
           {
            oldestTms = tms;
            oldest    = tickets[i];
           }
        }
   if(oldest != 0)
      g_trade.PositionClose(oldest);
  }

//+------------------------------------------------------------------+
void CloseEverything()
  {
   for(int i = OrdersTotal() - 1; i >= 0; i--)
     {
      ulong t = OrderGetTicket(i);
      if(t == 0)
         continue;
      if(OrderGetString(ORDER_SYMBOL) != _Symbol)
         continue;
      if(OrderGetInteger(ORDER_MAGIC) != InpMagic)
         continue;
      g_trade.OrderDelete(t);
     }
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong t = PositionGetTicket(i);
      if(t == 0)
         continue;
      if(PositionGetString(POSITION_SYMBOL) != _Symbol)
         continue;
      if(PositionGetInteger(POSITION_MAGIC) != InpMagic)
         continue;
      g_trade.PositionClose(t);
     }
  }

//+------------------------------------------------------------------+
//| Flat: place the two-sided entry straddle                         |
//+------------------------------------------------------------------+
void PlaceStraddle(const MqlTick &tick, double D)
  {
   double vol = CalcLots(D);
   if(vol <= 0.0)
      return;

   double buyPrice  = RoundPrice(tick.ask + D);
   double sellPrice = RoundPrice(tick.bid - D);
   double buyTP  = (InpRewardMultiple > 0.0) ? RoundPrice(buyPrice + D * InpRewardMultiple)  : 0.0;
   double sellTP = (InpRewardMultiple > 0.0) ? RoundPrice(sellPrice - D * InpRewardMultiple) : 0.0;

   g_trade.BuyStop(vol, buyPrice, _Symbol, RoundPrice(buyPrice - D), buyTP,
                   ORDER_TIME_GTC, 0, "straddle");
   g_trade.SellStop(vol, sellPrice, _Symbol, RoundPrice(sellPrice + D), sellTP,
                    ORDER_TIME_GTC, 0, "straddle");
  }

//+------------------------------------------------------------------+
//| Flat with both pendings: keep the straddle centered on price     |
//+------------------------------------------------------------------+
void RecenterStraddle(const MqlTick &tick, double D,
                      ulong buyT, ulong sellT, double spreadPts)
  {
   if(spreadPts > InpMaxSpreadPts)   // don't chase price on a bad spread
      return;

   double step  = MathMax(InpTrailStepPts, 10.0) * _Point;
   double dBuy  = RoundPrice(tick.ask + D);
   double dSell = RoundPrice(tick.bid - D);

   if(buyT != 0 && OrderSelect(buyT))
     {
      double op = OrderGetDouble(ORDER_PRICE_OPEN);
      if(MathAbs(op - dBuy) > step)
        {
         double tp = (InpRewardMultiple > 0.0) ? RoundPrice(dBuy + D * InpRewardMultiple) : 0.0;
         g_trade.OrderModify(buyT, dBuy, RoundPrice(dBuy - D), tp, ORDER_TIME_GTC, 0);
        }
     }
   if(sellT != 0 && OrderSelect(sellT))
     {
      double op = OrderGetDouble(ORDER_PRICE_OPEN);
      if(MathAbs(op - dSell) > step)
        {
         double tp = (InpRewardMultiple > 0.0) ? RoundPrice(dSell - D * InpRewardMultiple) : 0.0;
         g_trade.OrderModify(sellT, dSell, RoundPrice(dSell + D), tp, ORDER_TIME_GTC, 0);
        }
     }
  }

//+------------------------------------------------------------------+
//| In position: trail the reversal stop order + the position SL     |
//+------------------------------------------------------------------+
void ManagePosition(ulong posTicket, const MqlTick &tick, double D,
                    ulong buyStopT, ulong sellStopT)
  {
   if(!PositionSelectByTicket(posTicket))
      return;

   long   type  = PositionGetInteger(POSITION_TYPE);
   double vol   = PositionGetDouble(POSITION_VOLUME);
   double entry = PositionGetDouble(POSITION_PRICE_OPEN);
   double curSL = PositionGetDouble(POSITION_SL);
   double curTP = PositionGetDouble(POSITION_TP);

   // reversal is always the same volume as the position: together with the
   // position SL at the same level this flips on hedging accounts and can
   // never end up oversized on netting accounts
   double revVol = vol;
   double step   = InpTrailStepPts * _Point;

   if(type == POSITION_TYPE_BUY)
     {
      if(buyStopT != 0)                       // leftover same-side pending
         g_trade.OrderDelete(buyStopT);

      double level = RoundPrice(tick.bid - D);
      double revSL = RoundPrice(level + D);
      double revTP = (InpRewardMultiple > 0.0) ? RoundPrice(level - D * InpRewardMultiple) : 0.0;

      if(sellStopT == 0)
         g_trade.SellStop(revVol, level, _Symbol, revSL, revTP, ORDER_TIME_GTC, 0, "reverse");
      else if(OrderSelect(sellStopT))
        {
         double op = OrderGetDouble(ORDER_PRICE_OPEN);
         if(level > op + step)               // trail up only
            g_trade.OrderModify(sellStopT, level, revSL, revTP, ORDER_TIME_GTC, 0);
        }

      double newSL = curSL;
      if(curSL == 0.0 || level > curSL + step)
         newSL = level;
      double wantTP = (curTP > 0.0) ? curTP
                    : ((InpRewardMultiple > 0.0) ? RoundPrice(entry + D * InpRewardMultiple) : 0.0);
      if(MathAbs(newSL - curSL) > _Point * 0.5 || MathAbs(wantTP - curTP) > _Point * 0.5)
         g_trade.PositionModify(posTicket, newSL, wantTP);
     }
   else if(type == POSITION_TYPE_SELL)
     {
      if(sellStopT != 0)                      // leftover same-side pending
         g_trade.OrderDelete(sellStopT);

      double level = RoundPrice(tick.ask + D);
      double revSL = RoundPrice(level - D);
      double revTP = (InpRewardMultiple > 0.0) ? RoundPrice(level + D * InpRewardMultiple) : 0.0;

      if(buyStopT == 0)
         g_trade.BuyStop(revVol, level, _Symbol, revSL, revTP, ORDER_TIME_GTC, 0, "reverse");
      else if(OrderSelect(buyStopT))
        {
         double op = OrderGetDouble(ORDER_PRICE_OPEN);
         if(level < op - step)               // trail down only
            g_trade.OrderModify(buyStopT, level, revSL, revTP, ORDER_TIME_GTC, 0);
        }

      double newSL = curSL;
      if(curSL == 0.0 || level < curSL - step)
         newSL = level;
      double wantTP = (curTP > 0.0) ? curTP
                    : ((InpRewardMultiple > 0.0) ? RoundPrice(entry - D * InpRewardMultiple) : 0.0);
      if(MathAbs(newSL - curSL) > _Point * 0.5 || MathAbs(wantTP - curTP) > _Point * 0.5)
         g_trade.PositionModify(posTicket, newSL, wantTP);
     }
  }
//+------------------------------------------------------------------+
