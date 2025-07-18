import { MigrationInterface, QueryRunner } from "typeorm";

export class Location1752829065985 implements MigrationInterface {
    name = 'Location1752829065985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`location\` (\`id\` int NOT NULL AUTO_INCREMENT, \`location_name\` varchar(200) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`buildingId\` int NULL, UNIQUE INDEX \`IDX_1b092006187b4f20e65471245e\` (\`location_name\`, \`buildingId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`location\` ADD CONSTRAINT \`FK_9d3c879ab8834dc2d6c46bb3665\` FOREIGN KEY (\`buildingId\`) REFERENCES \`building\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` DROP FOREIGN KEY \`FK_9d3c879ab8834dc2d6c46bb3665\``);
        await queryRunner.query(`DROP INDEX \`IDX_1b092006187b4f20e65471245e\` ON \`location\``);
        await queryRunner.query(`DROP TABLE \`location\``);
    }

}
