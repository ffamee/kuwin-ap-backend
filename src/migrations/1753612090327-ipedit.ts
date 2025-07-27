import { MigrationInterface, QueryRunner } from 'typeorm';

export class Ipedit1753612090327 implements MigrationInterface {
  name = 'Ipedit1753612090327';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_01d66f7893b46924817c84b65f\` ON \`ip\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d1578178ef15d975790e47e229\` ON \`ip\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`ip\` CHANGE \`ip_number\` \`ip_number\` bigint AS (INET_ATON(ip_address)) STORED NOT NULL`,
    );
    await queryRunner.query(
      `INSERT INTO \`mysql_db\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, ?, ?, ?, ?)`,
      [
        'mysql_db',
        'ip',
        'GENERATED_COLUMN',
        'ip_number',
        'INET_ATON(ip_address)',
      ],
    );
    await queryRunner.query(
      `ALTER TABLE \`ip\` CHANGE \`ip_binary\` \`ip_binary\` varbinary(128) AS (CAST(LPAD(BIN(INET_ATON(ip_address)), 32, '0') AS BINARY(32))) STORED NOT NULL`,
    );
    await queryRunner.query(
      `INSERT INTO \`mysql_db\`.\`typeorm_metadata\`(\`database\`, \`schema\`, \`table\`, \`type\`, \`name\`, \`value\`) VALUES (DEFAULT, ?, ?, ?, ?, ?)`,
      [
        'mysql_db',
        'ip',
        'GENERATED_COLUMN',
        'ip_binary',
        "CAST(LPAD(BIN(INET_ATON(ip_address)), 32, '0') AS BINARY(32))",
      ],
    );
    await queryRunner.query(
      `ALTER TABLE \`ip\` ADD CONSTRAINT \`CHK_IP\` CHECK (is_ipv4(ip_address) = 1)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`ip\` DROP CONSTRAINT \`CHK_IP\``);
    await queryRunner.query(
      `DELETE FROM \`mysql_db\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ? AND \`table\` = ?`,
      ['GENERATED_COLUMN', 'ip_binary', 'mysql_db', 'ip'],
    );
    await queryRunner.query(
      `ALTER TABLE \`ip\` CHANGE \`ip_binary\` \`ip_binary\` varbinary(128) NOT NULL`,
    );
    await queryRunner.query(
      `DELETE FROM \`mysql_db\`.\`typeorm_metadata\` WHERE \`type\` = ? AND \`name\` = ? AND \`schema\` = ? AND \`table\` = ?`,
      ['GENERATED_COLUMN', 'ip_number', 'mysql_db', 'ip'],
    );
    await queryRunner.query(
      `ALTER TABLE \`ip\` CHANGE \`ip_number\` \`ip_number\` bigint UNSIGNED NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_d1578178ef15d975790e47e229\` ON \`ip\` (\`ip_number\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_01d66f7893b46924817c84b65f\` ON \`ip\` (\`ip_binary\`)`,
    );
  }
}

