import { MigrationInterface, QueryRunner } from "typeorm";

export class History1753092916578 implements MigrationInterface {
    name = 'History1753092916578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`history\` (\`id\` int NOT NULL AUTO_INCREMENT, \`comment\` text NULL, \`config_id\` int NOT NULL, \`started_at\` datetime(6) NOT NULL, \`ended_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`accesspointId\` int NULL, \`ipId\` int NULL, \`locationId\` int NULL, UNIQUE INDEX \`IDX_5825fc2e0f16b15f5e8c4adac2\` (\`config_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`history\` ADD CONSTRAINT \`FK_a2a6ea46f77b4b00a0c4bf47af2\` FOREIGN KEY (\`accesspointId\`) REFERENCES \`accesspoint\`(\`ap_id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`history\` ADD CONSTRAINT \`FK_f01fd0f4cade4114af43c2bbc7f\` FOREIGN KEY (\`ipId\`) REFERENCES \`ip\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`history\` ADD CONSTRAINT \`FK_4136ed1317339574174703e232b\` FOREIGN KEY (\`locationId\`) REFERENCES \`location\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`history\` DROP FOREIGN KEY \`FK_4136ed1317339574174703e232b\``);
        await queryRunner.query(`ALTER TABLE \`history\` DROP FOREIGN KEY \`FK_f01fd0f4cade4114af43c2bbc7f\``);
        await queryRunner.query(`ALTER TABLE \`history\` DROP FOREIGN KEY \`FK_a2a6ea46f77b4b00a0c4bf47af2\``);
        await queryRunner.query(`DROP INDEX \`IDX_5825fc2e0f16b15f5e8c4adac2\` ON \`history\``);
        await queryRunner.query(`DROP TABLE \`history\``);
    }

}
