import { MigrationInterface, QueryRunner } from "typeorm";

export class Updateconfig1754227538021 implements MigrationInterface {
    name = 'Updateconfig1754227538021'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`FK_57083ab9ff7fd4dea02b7bd010f\` ON \`entity\``);
        await queryRunner.query(`DROP INDEX \`FK_3d099fa9f88c713786cc24a97f9\` ON \`building\``);
        await queryRunner.query(`DROP INDEX \`FK_9d3c879ab8834dc2d6c46bb3665\` ON \`location\``);
        await queryRunner.query(`ALTER TABLE \`configuration\` CHANGE \`status\` \`status\` enum ('PENDING', 'UP', 'RADIO_OFF', 'DOWN', 'DOWNLOAD', 'MAINTENANCE', 'MISMATCH') NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`IDX_1b092006187b4f20e65471245e\` ON \`location\` (\`location_name\`, \`buildingId\`)`);
        await queryRunner.query(`ALTER TABLE \`entity\` ADD CONSTRAINT \`FK_57083ab9ff7fd4dea02b7bd010f\` FOREIGN KEY (\`sectionId\`) REFERENCES \`section\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`building\` ADD CONSTRAINT \`FK_3d099fa9f88c713786cc24a97f9\` FOREIGN KEY (\`entityId\`) REFERENCES \`entity\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD CONSTRAINT \`FK_9d3c879ab8834dc2d6c46bb3665\` FOREIGN KEY (\`buildingId\`) REFERENCES \`building\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` DROP FOREIGN KEY \`FK_9d3c879ab8834dc2d6c46bb3665\``);
        await queryRunner.query(`ALTER TABLE \`building\` DROP FOREIGN KEY \`FK_3d099fa9f88c713786cc24a97f9\``);
        await queryRunner.query(`ALTER TABLE \`entity\` DROP FOREIGN KEY \`FK_57083ab9ff7fd4dea02b7bd010f\``);
        await queryRunner.query(`DROP INDEX \`IDX_1b092006187b4f20e65471245e\` ON \`location\``);
        await queryRunner.query(`ALTER TABLE \`configuration\` CHANGE \`status\` \`status\` enum ('UP', 'RADIO_OFF', 'DOWN', 'DOWNLOAD') NULL`);
        await queryRunner.query(`CREATE INDEX \`FK_9d3c879ab8834dc2d6c46bb3665\` ON \`location\` (\`buildingId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_3d099fa9f88c713786cc24a97f9\` ON \`building\` (\`entityId\`)`);
        await queryRunner.query(`CREATE INDEX \`FK_57083ab9ff7fd4dea02b7bd010f\` ON \`entity\` (\`sectionId\`)`);
    }

}
