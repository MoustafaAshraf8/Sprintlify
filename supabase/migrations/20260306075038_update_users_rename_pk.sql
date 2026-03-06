BEGIN;

   -- 1. create users_id column
   ALTER TABLE users
      ADD COLUMN IF NOT EXISTS user_id UUID DEFAULT gen_random_uuid();
   
   -- 2. copy already existing primary-keys
   UPDATE users
      SET user_id = id;

   -- 3. drop foreign-key constraint
   ALTER TABLE posts
      DROP CONSTRAINT posts_user_id_fkey;

   -- 4. drop primary-key constraint
   ALTER TABLE users
      DROP CONSTRAINT users_pkey;

   -- 5. drop id column
   ALTER TABLE users
      DROP COLUMN id;

   -- 6. add primary-key constraint
   ALTER TABLE users
      ADD CONSTRAINT users_users_id_pk PRIMARY KEY (user_id);

   -- 7. add posts foreign-key
   ALTER TABLE posts
      ADD CONSTRAINT posts_users_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id)
      ON UPDATE CASCADE
      ON DELETE CASCADE;
   
COMMIT;