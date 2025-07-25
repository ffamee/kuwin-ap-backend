import { MigrationInterface, QueryRunner } from "typeorm";

export class Config1753166262539 implements MigrationInterface {
    name = 'Config1753166262539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`configuration\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`last_seen_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`state\` enum ('PENDING', 'ACTIVE', 'FAILED', 'MISMATCH', 'MAINTENANCE') NOT NULL DEFAULT 'PENDING', \`tx\` bigint UNSIGNED NULL, \`rx\` bigint UNSIGNED NULL, \`client_24\` int UNSIGNED NULL, \`client_5\` int UNSIGNED NULL, \`client_6\` int UNSIGNED NULL, \`status\` enum ('UP', 'RADIO_OFF') NULL, \`accesspointId\` int NOT NULL, \`ipId\` int NOT NULL, \`locationId\` int NOT NULL, UNIQUE INDEX \`REL_5154f91049e7de9b5fd923a02f\` (\`accesspointId\`), UNIQUE INDEX \`REL_53af57b88e15294cb707c2ed46\` (\`ipId\`), UNIQUE INDEX \`REL_40ff236287e6cb45740445bf24\` (\`locationId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`configuration\` ADD CONSTRAINT \`FK_5154f91049e7de9b5fd923a02fb\` FOREIGN KEY (\`accesspointId\`) REFERENCES \`accesspoint\`(\`ap_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`configuration\` ADD CONSTRAINT \`FK_53af57b88e15294cb707c2ed464\` FOREIGN KEY (\`ipId\`) REFERENCES \`ip\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`configuration\` ADD CONSTRAINT \`FK_40ff236287e6cb45740445bf247\` FOREIGN KEY (\`locationId\`) REFERENCES \`location\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`configuration\` DROP FOREIGN KEY \`FK_40ff236287e6cb45740445bf247\``);
        await queryRunner.query(`ALTER TABLE \`configuration\` DROP FOREIGN KEY \`FK_53af57b88e15294cb707c2ed464\``);
        await queryRunner.query(`ALTER TABLE \`configuration\` DROP FOREIGN KEY \`FK_5154f91049e7de9b5fd923a02fb\``);
        await queryRunner.query(`DROP INDEX \`REL_40ff236287e6cb45740445bf24\` ON \`configuration\``);
        await queryRunner.query(`DROP INDEX \`REL_53af57b88e15294cb707c2ed46\` ON \`configuration\``);
        await queryRunner.query(`DROP INDEX \`REL_5154f91049e7de9b5fd923a02f\` ON \`configuration\``);
        await queryRunner.query(`DROP TABLE \`configuration\``);
    }

}
