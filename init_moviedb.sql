CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DROP TABLE IF EXISTS 
  favorite_list_shares,
  favorite_list_items,
  favorite_lists,
  reviews,
  group_movies,
  group_join_requests,
  group_members,
  groups,
  users
CASCADE;

DROP TYPE IF EXISTS group_member_role CASCADE;
DROP TYPE IF EXISTS join_request_status CASCADE;


-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(320) NOT NULL UNIQUE,
  username VARCHAR(100) UNIQUE,
  password_hash TEXT NOT NULL
);

-- Groups (ryhmät)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_visible BOOLEAN DEFAULT TRUE
);
CREATE UNIQUE INDEX groups_name_owner_idx ON groups (owner_id, name);

-- Group membership
CREATE TYPE group_member_role AS ENUM ('owner','admin','member');

CREATE TABLE group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role group_member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Join requests
CREATE TYPE join_request_status AS ENUM ('pending','accepted','rejected');

CREATE TABLE group_join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status join_request_status NOT NULL DEFAULT 'pending'
);

-- Movies added to group (store external movie id)
CREATE TABLE group_movies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  movie_external_id VARCHAR(100) NOT NULL,
  media_type VARCHAR(10) NOT NULL DEFAULT 'movie',
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  added_by UUID REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_group_movies_movieid ON group_movies (movie_external_id);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_external_id VARCHAR(100) NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_reviews_movieid ON reviews (movie_external_id);

-- Favorite lists
CREATE TABLE favorite_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT
);
CREATE UNIQUE INDEX ux_favorite_lists_owner_title ON favorite_lists (user_id, title);

-- Favorite list items
CREATE TABLE favorite_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  favorite_list_id UUID NOT NULL REFERENCES favorite_lists(id) ON DELETE CASCADE,
  movie_external_id VARCHAR(100) NOT NULL,
  position INTEGER DEFAULT 0
);
CREATE INDEX idx_favitems_movieid ON favorite_list_items (movie_external_id);
CREATE INDEX idx_favitems_listid_position ON favorite_list_items (favorite_list_id, position);

-- Sharing favorite lists as URL
CREATE TABLE favorite_list_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  favorite_list_id UUID NOT NULL REFERENCES favorite_lists(id) ON DELETE CASCADE,
  share_token VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Constraints and indexes
CREATE UNIQUE INDEX ux_group_join_request_unique ON group_join_requests (group_id, user_id) WHERE status = 'pending';

CREATE VIEW public_groups AS
SELECT id, name, description, created_at, owner_id
FROM groups
WHERE is_visible = TRUE;

ALTER TABLE group_movies 
ADD CONSTRAINT ux_group_movie 
UNIQUE (group_id, movie_external_id, media_type);

ALTER TABLE favorite_list_items ADD CONSTRAINT ux_list_item
  UNIQUE (favorite_list_id, movie_external_id);

ALTER TABLE reviews ADD CONSTRAINT ux_user_movie_review
  UNIQUE (user_id, movie_external_id);

CREATE INDEX idx_users_email_lower ON users (lower(email));
CREATE INDEX idx_users_username_lower ON users (lower(username));

-- Functions
CREATE OR REPLACE FUNCTION add_owner_to_group_members()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner')
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_add_owner_to_group_members
AFTER INSERT ON groups
FOR EACH ROW
EXECUTE FUNCTION add_owner_to_group_members();