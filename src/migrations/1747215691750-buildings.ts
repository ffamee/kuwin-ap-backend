import { MigrationInterface, QueryRunner } from "typeorm";

export class Buildings1747215691750 implements MigrationInterface {
    name = 'Buildings1747215691750'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`building\` ADD \`entityId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`building\` ADD CONSTRAINT \`FK_3d099fa9f88c713786cc24a97f9\` FOREIGN KEY (\`entityId\`) REFERENCES \`entity\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`building\` DROP FOREIGN KEY \`FK_3d099fa9f88c713786cc24a97f9\``);
        await queryRunner.query(`ALTER TABLE \`building\` DROP COLUMN \`entityId\``);
    }

}
