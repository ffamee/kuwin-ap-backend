import { MigrationInterface, QueryRunner } from "typeorm";

export class EntityBuildingApFk1747369975903 implements MigrationInterface {
    name = 'EntityBuildingApFk1747369975903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`accesspoint\` ADD \`buildingId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`building\` ADD \`entityId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`accesspoint\` ADD CONSTRAINT \`FK_d7b27ccaab549b2b584ff588b04\` FOREIGN KEY (\`buildingId\`) REFERENCES \`building\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`building\` ADD CONSTRAINT \`FK_3d099fa9f88c713786cc24a97f9\` FOREIGN KEY (\`entityId\`) REFERENCES \`entity\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`building\` DROP FOREIGN KEY \`FK_3d099fa9f88c713786cc24a97f9\``);
        await queryRunner.query(`ALTER TABLE \`accesspoint\` DROP FOREIGN KEY \`FK_d7b27ccaab549b2b584ff588b04\``);
        await queryRunner.query(`ALTER TABLE \`building\` DROP COLUMN \`entityId\``);
        await queryRunner.query(`ALTER TABLE \`accesspoint\` DROP COLUMN \`buildingId\``);
    }

}
