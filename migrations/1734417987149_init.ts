import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  // Enable required extensions
  pgm.sql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Cards lookup table
  pgm.createTable("cards", {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    value: {
      type: "integer",
      notNull: true,
    }
  });

  // Insert card values
  const cards: number[] = [];
  for (let i = 1; i <= 12; i++) {
    cards.push(i);
  }
  const allCards = cards
    .flatMap(() => cards)
    .map((card) => `(gen_random_uuid(), ${card})`)
    .join(", ");

  pgm.sql(`INSERT INTO cards (id, value) VALUES ${allCards}`);
  // 18 wild cards
  pgm.sql(
    `INSERT INTO cards (id, value) VALUES ${Array(18)
      .fill("(gen_random_uuid(), 0)")
      .join(", ")}`
  );

  // Users table
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    username: { type: 'varchar(50)', notNull: true, unique: true },
    email: { type: 'varchar(254)', notNull: true, unique: true },
    gravatar: { type: 'varchar(100)', notNull: true },
    password_hash: { type: 'varchar(60)', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Games table
  pgm.createTable('games', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'waiting',
      check: "status IN ('waiting', 'in_progress', 'completed', 'cancelled')",
    },
    player_count: {
      type: "integer",
      default: 4,
      notNull: true,
    },
    password: {
      type: "text",
    },
    current_seat: {
      type: "integer",
      notNull: true,
      default: 1,
    },
    turn: {
      type: "integer",
      default: 0,
    },
    board_state: { type: 'jsonb', notNull: true, default: '{}' },
    winner_id: { type: 'uuid', references: 'users', onDelete: 'SET NULL' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Game Players table (combines game_users and game_players)
  pgm.createTable('game_players', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    game_id: { type: 'uuid', notNull: true, references: 'games', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    seat: { type: 'integer', notNull: true },
    last_draw_turn: {
      type: "integer",
      default: -1,
    },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Game Cards table
  pgm.createTable('game_cards', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    game_id: { type: 'uuid', notNull: true, references: 'games', onDelete: 'CASCADE' },
    card_id: { type: 'uuid', notNull: true, references: 'cards', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', references: 'users', onDelete: 'CASCADE' },
    position: { type: 'uuid', notNull: true, default: pgm.func('uuid_generate_v4()') },
    pile: {
      type: "integer",
      notNull: true,
      default: 0,
    }
  });

  // Game Moves table
  pgm.createTable('game_moves', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    game_id: { type: 'uuid', notNull: true, references: 'games', onDelete: 'CASCADE' },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    card_played: { type: 'jsonb', notNull: true },
    position: { type: 'point', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  });

  // Create necessary indexes
  pgm.createIndex('users', 'username');
  pgm.createIndex('users', 'email');
  pgm.createIndex('games', 'status');
  pgm.createIndex('game_players', ['game_id', 'user_id'], { unique: true });
  pgm.createIndex('game_players', ['game_id', 'seat'], { unique: true });
  pgm.createIndex('game_moves', ['game_id', 'created_at']);
  pgm.createIndex('game_cards', ['game_id', 'user_id']);
  pgm.createIndex('game_cards', ['game_id', 'pile']);

  // Create updated_at trigger function
  pgm.createFunction(
    'update_updated_at_column',
    [],
    {
      returns: 'trigger',
      language: 'plpgsql',
    },
    `
    BEGIN
      NEW.updated_at = current_timestamp;
      RETURN NEW;
    END;
    `
  );

  // Add updated_at triggers
  pgm.createTrigger('users', 'update_updated_at_trigger', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_updated_at_column',
    level: 'ROW',
  });

  pgm.createTrigger('games', 'update_updated_at_trigger', {
    when: 'BEFORE',
    operation: 'UPDATE',
    function: 'update_updated_at_column',
    level: 'ROW',
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  // Drop triggers first
  pgm.dropTrigger('users', 'update_updated_at_trigger');
  pgm.dropTrigger('games', 'update_updated_at_trigger');
  
  // Drop function
  pgm.dropFunction('update_updated_at_column', []);

  // Drop tables in reverse order of their dependencies
  pgm.dropTable('game_moves');
  pgm.dropTable('game_cards');
  pgm.dropTable('game_players');
  pgm.dropTable('games');
  pgm.dropTable('users');
  pgm.dropTable('cards');
}