/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.renameColumn('websites', 'downCycles', 'totalCycles')
};

exports.down = pgm => {
    pgm.renameColumn('websites', 'totalCycles', 'downCycles')
};
