# [Clue Sheet](https://cluesheet.pana.moe)

An online interactive sheet for the board game Clue (or Cluedo, depending on region).

Select the number of players in the game and enter their initials in the appropriate boxes.
If you enter 2 players only, the sheet assumes that you are playing with the standard two player rules of having 4 of the cards distributed on the board and automatically generates another column for these "board" cards.

- Click a cell once to mark an "X".
- Click it again to mark a "?".
- Third click marks it as "-".
- Another click will clear the cell.

You can click on a suspect/weapon/location to highlight it, e.g. to indicate it's a card you've already shown.

Undo and redo buttons across the top of the page.

Reset button at the bottom of the page.

Data should survive a page refresh using IndexedDB and localStorage.

## Notes on this fork

- Fixed a bug where cells above player 3 were not interactive: the data template is now created with the proper number of columns and header rows are generated correctly.
- Translated the UI into French (labels and instructions).
