/*
 * File: conway.js
 * Project: htdoc
 * File Created: Tuesday, 13th April 2021 1:49:45 pm
 * Author: Hayden Kowalchuk
 * -----
 * Copyright (c) 2021 Hayden Kowalchuk, Hayden Kowalchuk
 * License: BSD 3-clause "New" or "Revised" License, http://www.opensource.org/licenses/BSD-3-Clause
 */


/* Globals */
var board_size = 32;
var allowed_to_play = false;
var timer_func = 0;
var fps = 0;

var grid = [];
var match = [];

function create_internal_grid() {
  if (grid.length > 0) {
    return;
  }
  /* Build js game board of size NxN */
  for (let row = 0; row < board_size; row++) {
    grid.push([]);
    for (let col = 0; col < board_size; col++) {
      grid[row][col] = 0;
    }
  }
}

/* Return how many pairs */
function get_board_size() {
  return board_size;
}

function _reset_xor() {
  for (let row = 0; row < board_size; row++) {
    for (let col = 0; col < board_size; col++) {
      grid[row][col] = (row + col) % 2;
    }
  }
  conway_draw();
}

function _reset_osci() {
  conway_clear();
  grid[9][9] = 1;
  grid[10][8] = 1;
  grid[10][9] = 1;
  grid[10][10] = 1;
  grid[11][9] = 1;
  conway_draw();
}

function _reset_glider() {
  let x = 14;
  let y = 16;
  conway_clear();
  grid[x][y] = 1;
  grid[x + 2][y] = 1;
  grid[x + 1][y + 1] = 1;
  grid[x + 2][y + 1] = 1;
  grid[x + 1][y + 2] = 1;
  conway_draw();
}

/* Default reset, oscillator */
function conway_reset() {
  _reset_osci();
  conway_draw();
}

/* Sets all cells to dead */
function conway_clear() {
  for (let row = 0; row < board_size; row++) {
    for (let col = 0; col < board_size; col++) {
      grid[row][col] = 0;
    }
  }
  conway_draw();
}

/* Outputs our internal grid state to html */
function conway_draw() {
  for (let row = 0; row < board_size; row++) {
    for (let col = 0; col < board_size; col++) {
      let alive = grid[row][col];
      let id = row + "_" + col;
      let cell = document.getElementById(id);
      cell.classList.remove("on");
      if (alive) {
        cell.classList.add("on");
      }
    }
  }
}

function count_neighbors(x, y) {
  /* Support Wrapping */
  let prev_x = (x > 0 ? x - 1 : board_size - 1);
  let next_x = (x == board_size - 1 ? 0 : x + 1);
  let prev_y = (y > 0 ? y - 1 : board_size - 1);
  let next_y = (y == board_size - 1 ? 0 : y + 1);

  let nw = [prev_x, prev_y];
  let n = [x, prev_y];
  let ne = [next_x, prev_y];

  let w = [prev_x, y];
  let e = [next_x, y];

  let sw = [prev_x, next_y];
  let s = [x, next_y];
  let se = [next_x, next_y];

  let neighbors =
    (grid[nw[0]][nw[1]] + grid[n[0]][n[1]] + grid[ne[0]][ne[1]]) +
    (grid[w[0]][w[1]] + grid[e[0]][e[1]]) +
    (grid[sw[0]][sw[1]] + grid[s[0]][s[1]] + grid[se[0]][se[1]]);

  return neighbors;
}

function advance_generation(steps) {
  for (let i = 0; i < steps; i++) {
    let next_grid = [];
    for (let row = 0; row < board_size; row++) {
      next_grid.push([]);
      for (let col = 0; col < board_size; col++) {
        let alive = grid[row][col];
        let next_alive = 0;
        let neighbors = count_neighbors(row, col);

        if (alive && (neighbors == 2 || neighbors == 3)) {
          /* Sustainable */
          next_alive = 1;
        } else if (alive && (neighbors > 3)) {
          /* Overcrowded */
          next_alive = 0;
        } else if (alive && (neighbors < 2)) {
          /* Lonely */
          next_alive = 0;
        } else if (!alive && (neighbors == 3)) {
          /* Resurrection */
          next_alive = 1;
        }

        next_grid[row][col] = next_alive;
      }
    }
    /* update */
    grid = next_grid;
  }
}

function advance_gen1() {
  advance_generation(1);
  conway_draw();
}

function advance_gen23() {
  advance_generation(23);
  conway_draw();
}

function create_game_board() {
  let table = document.querySelector("table");
  table.onmousedown = setmousedown;
  table.onmouseup = setmouseup;

  /* Build html table game board of size NxN */
  for (let row = 0; row < board_size; row++) {
    let cur_row = table.insertRow();
    for (let col = 0; col < board_size; col++) {

      let cell = cur_row.insertCell();
      let el = document.createElement('div');
      el.classList.add("cell");
      el.onmousedown = cell_click;
      el.onmouseover = cell_over;
      el.id = row + "_" + col;
      cell.appendChild(el);
    }
  }
}

var ismousedown = false;
var ismousetype = 0;
/* Mouse button constants */
const LEFT = 1;
const MIDDLE = 2;
const RIGHT = 3;

function setmousedown(evt) {
  ismousedown = true;
  ismousetype = evt.which;
}

function setmouseup(evt) {
  ismousedown = false;
  ismousetype = 0;
}

function cell_toggle(x, y) {
  // flip it
  grid[x][y] = !grid[x][y];

  // redraw if not animating
  if (!timer_func) {
    conway_draw();
  }
}

function cell_on(x, y) {
  grid[x][y] = 1;

  // redraw if not animating
  if (!timer_func) {
    conway_draw();
  }
}

function cell_off(x, y) {
  grid[x][y] = 0;

  // redraw if not animating
  if (!timer_func) {
    conway_draw();
  }
}

/* user clicked a cell */
function cell_click(evt) {
  let cell_id = evt.srcElement.id;
  let id = cell_id.split("_");
  let x = parseInt(id[0]);
  let y = parseInt(id[1]);

  switch (evt.which) {
    case LEFT:
      cell_on(x, y);
      break;
    case MIDDLE:
      cell_toggle(x, y);
      break;
    case RIGHT:
      cell_off(x, y);
      break;
  }
  return false;
}

/* user moved over a cell */
function cell_over(evt) {
  if (ismousedown) {
    let cell_id = evt.srcElement.id;
    let id = cell_id.split("_");

    let x = parseInt(id[0]);
    let y = parseInt(id[1]);

    switch (ismousetype) {
      case LEFT:
        cell_on(x, y);
        break;
      case MIDDLE:
        cell_toggle(x, y);
        break;
      case RIGHT:
        cell_off(x, y);
        break;
    }
  }
}

/* Start game animation */
function conway_animate(frames) {
  clearInterval(timer_func);
  /* Update every second */
  timer_func = setInterval(function() {
    advance_gen1();
  }, 1000 / frames);
}

function conway_stop() {
  clearInterval(timer_func);
  timer_func = 0;
}

function setup_conway() {
  create_internal_grid();
  create_game_board();
  conway_reset();
  conway_draw();

  document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
  }, false);
}