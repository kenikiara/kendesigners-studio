# GoldStraddleScalper (MT5)

Trailing stop-and-reverse straddle scalper for **XAUUSD M1**, built to match the
reference video: price is always bracketed — a pending stop order trails the open
position and acts as combined stop-loss + reversal entry. Losses are capped at one
bracket distance; winners run on the trail. Sizing is risk-% based (no martingale,
volume never escalates).

## Files

| File | Purpose |
|---|---|
| `GoldStraddleScalper.mq5` | The Expert Advisor (this is what MT5 backtests) |
| `GoldStraddleScalper.set` | Breakout preset (video-faithful) |
| `GoldStraddleScalper.reverse.set` | Reverse preset (entries & SL interchanged / fade) |
| `GoldStraddleScalper.backtest.xml` | Reference of the exact tester configuration |

## Entry modes (input `InpEntryMode`)

| Mode | Value | Behaviour |
|---|---|---|
| **Breakout** | `0` | Buy the break up / sell the break down; the opposite stop **trails** behind price as combined stop-loss + reversal. Trend-following — the strategy in the reference video. |
| **Reverse** | `1` | Buy the dip / sell the rally — you enter where the breakout build would have stopped out (**entries and SL interchanged**). Fixed **+D** take-profit, hard **-D** stop, and the stop doubles as the reversal. Mean-reversion / fade. |

Both modes cap every trade's loss at one distance `D`; neither holds a losing
trade or scales volume. Load `GoldStraddleScalper.set` for breakout or
`GoldStraddleScalper.reverse.set` for the interchanged version, and compare the
two backtests on the same period.

## Backtest steps

1. Copy `GoldStraddleScalper.mq5` into your MT5 data folder under `MQL5/Experts/`
   (MT5: *File → Open Data Folder*).
2. Open it in MetaEditor and press **F7** to compile (produces the `.ex5` the tester runs).
3. In MT5 open the Strategy Tester (**Ctrl+R**) and set:
   - Expert: `GoldStraddleScalper`
   - Symbol: `XAUUSD`, Timeframe: `M1`
   - Modelling: **Every tick based on real ticks**
   - Deposit: your account size (e.g. 500 USD)
4. On the *Inputs* tab click **Load** and pick `GoldStraddleScalper.set`.
5. Run. For live/demo use, run it on a VPS-hosted desktop MT5 — the mobile app
   (as in the video) only displays the trades; it cannot run EAs.

## Built-in protection (small-account settings in the .set)

- 0.5% of balance risked per flip, lot cap 0.50
- Hard stop-loss attached to every position and every pending order
- 3% daily equity loss → closes everything, flat until next day
- 3 losing flips in a row → closes everything, 30-minute cooldown (chop guard)
- Flat outside session hours (08–21 server time) — nothing held overnight
- Spread filter: no new cycle above 45 points spread
- ATR-adaptive bracket distance, clamped 200–600 points ($2.00–$6.00)
