import { MigrationInterface, QueryRunner } from "typeorm";

export class Ip1752827450090 implements MigrationInterface {
    name = 'Ip1752827450090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`ip\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ip_address\` varchar(31) NOT NULL, \`ip_number\` bigint UNSIGNED NOT NULL, \`ip_binary\` varbinary(128) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_74289432683eaa276a6aadc97c\` (\`ip_address\`), UNIQUE INDEX \`IDX_d1578178ef15d975790e47e229\` (\`ip_number\`), UNIQUE INDEX \`IDX_01d66f7893b46924817c84b65f\` (\`ip_binary\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_01d66f7893b46924817c84b65f\` ON \`ip\``);
        await queryRunner.query(`DROP INDEX \`IDX_d1578178ef15d975790e47e229\` ON \`ip\``);
        await queryRunner.query(`DROP INDEX \`IDX_74289432683eaa276a6aadc97c\` ON \`ip\``);
        await queryRunner.query(`DROP TABLE \`ip\``);
    }

}
