import { MigrationInterface, QueryRunner } from "typeorm";

export class Editconfig1753625178528 implements MigrationInterface {
    name = 'Editconfig1753625178528'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`configuration\` DROP FOREIGN KEY \`FK_5154f91049e7de9b5fd923a02fb\``);
        await queryRunner.query(`ALTER TABLE \`configuration\` CHANGE \`state\` \`state\` enum ('PENDING', 'ACTIVE', 'MISMATCH', 'MAINTENANCE') NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE \`configuration\` CHANGE \`status\` \`status\` enum ('UP', 'RADIO_OFF', 'DOWN') NULL`);
        await queryRunner.query(`ALTER TABLE \`configuration\` CHANGE \`accesspointId\` \`accesspointId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`configuration\` ADD CONSTRAINT \`FK_5154f91049e7de9b5fd923a02fb\` FOREIGN KEY (\`accesspointId\`) REFERENCES \`accesspoint\`(\`ap_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`configuration\` DROP FOREIGN KEY \`FK_5154f91049e7de9b5fd923a02fb\``);
        await queryRunner.query(`ALTER TABLE \`configuration\` CHANGE \`accesspointId\` \`accesspointId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`configuration\` CHANGE \`status\` \`status\` enum ('UP', 'RADIO_OFF') NULL`);
        await queryRunner.query(`ALTER TABLE \`configuration\` CHANGE \`state\` \`state\` enum ('PENDING', 'ACTIVE', 'FAILED', 'MISMATCH', 'MAINTENANCE') NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE \`configuration\` ADD CONSTRAINT \`FK_5154f91049e7de9b5fd923a02fb\` FOREIGN KEY (\`accesspointId\`) REFERENCES \`accesspoint\`(\`ap_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
