import { MigrationInterface, QueryRunner } from "typeorm";

export class DropEntitySectionCol1747210109510 implements MigrationInterface {
    name = 'DropEntitySectionCol1747210109510'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`entity\` DROP FOREIGN KEY \`FK_dcb38ff38ac21130a24ec5adcb5\``);
        await queryRunner.query(`ALTER TABLE \`entity\` CHANGE \`sec_type_id\` \`sectionId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`entity\` CHANGE \`sectionId\` \`sectionId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`entity\` ADD CONSTRAINT \`FK_57083ab9ff7fd4dea02b7bd010f\` FOREIGN KEY (\`sectionId\`) REFERENCES \`section\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`entity\` DROP FOREIGN KEY \`FK_57083ab9ff7fd4dea02b7bd010f\``);
        await queryRunner.query(`ALTER TABLE \`entity\` CHANGE \`sectionId\` \`sectionId\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`entity\` CHANGE \`sectionId\` \`sec_type_id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`entity\` ADD CONSTRAINT \`FK_dcb38ff38ac21130a24ec5adcb5\` FOREIGN KEY (\`sec_type_id\`) REFERENCES \`section\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

}
