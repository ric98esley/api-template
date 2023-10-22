'use strict';

const { PARANOID_TABLE } = require('../models/log.model/paranoid.model');
const { USER_TABLE } = require('../models/user.model');
const { CUSTOMER_TABLE } = require('../models/user.model/customer.model');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // Paranoid user
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS after_insert_users;
    `);
    await queryInterface.sequelize.query(`
      
        CREATE TRIGGER after_insert_users
            AFTER INSERT ON ${USER_TABLE}
            FOR EACH ROW
          BEGIN
            insert into ${PARANOID_TABLE} (executed_sql, reverse_sql, log_user, created_at)
            values(
              CONCAT("INSERT INTO ${USER_TABLE}
                  (id, username, email, password, role, recovery_token, active, created_at, updated_at, deleted_at)
                  VALUES (",
                  NEW.id,""", """,
                  NEW.username,""", """,
                  NEW.email,""", """,
                  NEW.password,""", """,
                  NEW.role, """, """,
                  NEW.recovery_token, """, """,
                  NEW.active, """, """,
                  NEW.created_at, """, """,
                  NEW.updated_at, """, """,
                  NEW.deleted_at, ");"),
              CONCAT("DELETE FROM ${USER_TABLE} WHERE id = ",  NEW.id,";"),
              CURRENT_USER(),
              now()
          );
          END
        
    `);
    await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS after_delete_users;
    `);
    await queryInterface.sequelize.query(`
    
      CREATE TRIGGER after_delete_users
          AFTER DELETE ON ${USER_TABLE}
          FOR EACH ROW
        BEGIN
          insert into ${PARANOID_TABLE} ( executed_sql, reverse_sql, log_user, created_at )
          values(
            CONCAT("DELETE FROM ${USER_TABLE} WHERE id = ", OLD.id,";"),
            CONCAT("INSERT INTO ${USER_TABLE} (id, username, email, password, role, recovery_token, active, created_at, updated_at, deleted_at)
                VALUES (",OLD.id,", """,OLD.username,""", """,OLD.email,""", """,OLD.password,""", """, OLD.role, """, """, OLD.recovery_token, """, """, OLD.active, """, """, OLD.created_at, """, """, OLD.updated_at, """, """, OLD.deleted_at, ");"),
            CURRENT_USER(),
            now()
        );
        END
      
    `);
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_update_users;
    `);
    await queryInterface.sequelize.query(`
    
      CREATE TRIGGER after_update_users
          AFTER UPDATE ON ${USER_TABLE}
          FOR EACH ROW
        BEGIN
          insert into ${PARANOID_TABLE} ( executed_sql, reverse_sql, log_user, created_at )
          values(
            CONCAT("UPDATE ${USER_TABLE} SET id = ",NEW.id,""", username = """,NEW.username,""", email =""",NEW.email,""", password = """,NEW.password,""", role = """, NEW.role, """, recovery_token = """, NEW.recovery_token, """, active = """, NEW.active, """,  created_at =""", NEW.created_at, """, updated_at = """, NEW.updated_at, """, deleted_at = """, NEW.deleted_at, ");"),
            CONCAT("UPDATE ${USER_TABLE} SET id = ",OLD.id,""", username = """,OLD.username,""", email =""",OLD.email,""", password = """,OLD.password,""" role = """, OLD.role, """, recovery_token = """, OLD.recovery_token, """, active = """, OLD.active, """,  created_at =""", OLD.created_at, """, updated_at = """, OLD.updated_at, """, deleted_at = """, OLD.deleted_at, ");"),
            CURRENT_USER(),
            now()
        );
        END
    
    `);

    // Paranoid CUSTOMER
    await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS after_insert_customers;
    `);

    await queryInterface.sequelize.query(`
      
        CREATE TRIGGER after_insert_customers
          AFTER INSERT ON ${CUSTOMER_TABLE}
          FOR EACH ROW
        BEGIN
          INSERT INTO ${PARANOID_TABLE} (executed_sql, reverse_sql, log_user, created_at)
          VALUES (
            CONCAT(
              "INSERT INTO ${CUSTOMER_TABLE} (id, name, last_name, phone, card_id, user_id, created_by_id, created_at, updated_at, deleted_at)
              VALUES (",
              NEW.id, ", '",
              NEW.name, "', '",
              NEW.last_name, "', '",
              NEW.phone, "', '",
              NEW.card_id, "', ",
              NEW.user_id, ", ",
              NEW.created_by_id, ", '",
              NEW.created_at, "', '",
              NEW.updated_at, "', '",
              NEW.deleted_at, "');"
            ),
            CONCAT(
              "DELETE FROM ${CUSTOMER_TABLE} WHERE id = ", NEW.id, ";"
            ),
            CURRENT_USER(),
            NOW()
          );
        END;
      
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_delete_customers;
    `);

    await queryInterface.sequelize.query(`
    
      CREATE TRIGGER after_delete_customers
        AFTER DELETE ON ${CUSTOMER_TABLE}
        FOR EACH ROW
      BEGIN
        INSERT INTO ${PARANOID_TABLE} (executed_sql, reverse_sql, log_user, created_at)
        VALUES (
          CONCAT("DELETE FROM ${CUSTOMER_TABLE} WHERE id = ", OLD.id, ";"),
          CONCAT(
            "INSERT INTO ${CUSTOMER_TABLE} (id, name, last_name, phone, card_id, userId, createdById, created_at, updated_at, deleted_at)
            VALUES (",
            OLD.id, ", '",
            OLD.name, "', '",
            OLD.last_name, "', '",
            OLD.phone, "', '",
            OLD.card_id, "', ",
            OLD.user_id, ", ",
            OLD.created_by_id, ", '",
            OLD.created_at, "', '",
            OLD.updated_at, "', '",
            OLD.deleted_at, "');"
          ),
          CURRENT_USER(),
          NOW()
        );
      END;
      
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_update_customers;
    `);

    await queryInterface.sequelize.query(`
    
      CREATE TRIGGER after_update_customers
        AFTER UPDATE ON ${CUSTOMER_TABLE}
        FOR EACH ROW
      BEGIN
        INSERT INTO ${PARANOID_TABLE} (executed_sql, reverse_sql, log_user, created_at)
        VALUES (
          CONCAT(
            "UPDATE ${CUSTOMER_TABLE} SET id = ", NEW.id, ", name = '", NEW.name, "', last_name = '", NEW.last_name, "', phone = '", NEW.phone, "', card_id = '", NEW.card_id, "', user_id = ", NEW.user_id, ", created_by_id = ", NEW.created_by_id, ", created_at = '", NEW.created_at, "', updated_at = '", NEW.updated_at, "', deleted_at = '", NEW.deleted_at, "';"
          ),
          CONCAT(
            "UPDATE ${CUSTOMER_TABLE} SET id = ", OLD.id, ", name = '", OLD.name, "', last_name = '", OLD.last_name, "', phone = '", OLD.phone, "', card_id = '", OLD.card_id, "', user_id = ", OLD.user_id, ", created_by_id = ", OLD.created_by_id, ", created_at = '", OLD.created_at, "', updated_at = '", OLD.updated_at, "', deleted_at = '", OLD.deleted_at, "';"
          ),
          CURRENT_USER(),
          NOW()
        );
      END;

`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_update_customers;
      `);
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_delete_customers;
      `);
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_insert_customers;
      `);
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_update_users;
      `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_delete_users;
      `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS after_insert_users;
      `);
  },
};
