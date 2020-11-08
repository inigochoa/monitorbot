/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumn('websites', {
        downCycles: {
            type: 'integer',
            notNull: true,
            default: 0
        }
    })
};

exports.down = pgm => {
    pgm.dropColumns('websites', [
        'downCycles',
    ])
};
