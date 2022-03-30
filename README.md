# mev-inspect for StarkNet

This is a simple project aiming to analyze transactions in StarkNet blocks and give information about the actions done by participants of that block.
Actions like:
 - Arbitrage
 - Liquidation
 - ... more later (thinking about in-game actions mev transactions)

To use it, run `npm init` and you may also have to install the cairo-lang package (see https://www.cairo-lang.org/docs/quickstart.html).
It run better in a Linux environment, I'm using WSL2 in order to run the project (tutorial https://www.youtube.com/watch?v=-atblwgc63E).

If you see code that can be improved, logic flaws, or any improvement that can be made, please reach out to me on discord dsi#9447, I'm here to learn as well.

# What is does now:

It fetch all blocks for the past 24 hours and rank the most actives accounts and contracts on goerli.

Type `hh run scripts/getTopAccountsPerDay.ts` to run the script (it use the starknet default provider and may take a while to fetch all the blocks).
