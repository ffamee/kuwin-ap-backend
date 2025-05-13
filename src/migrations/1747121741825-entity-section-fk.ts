import { MigrationInterface, QueryRunner } from "typeorm";

export class EntitySectionFk1747121741825 implements MigrationInterface {
    name = 'EntitySectionFk1747121741825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`entity\` DROP FOREIGN KEY \`entity_section_FK\``);
        await queryRunner.query(`ALTER TABLE \`entity\` CHANGE \`name\` \`name\` varchar(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`entity\` ADD CONSTRAINT \`FK_dcb38ff38ac21130a24ec5adcb5\` FOREIGN KEY (\`sec_type_id\`) REFERENCES \`section\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`entity\` DROP FOREIGN KEY \`FK_dcb38ff38ac21130a24ec5adcb5\``);
        await queryRunner.query(`ALTER TABLE \`entity\` CHANGE \`name\` \`name\` varchar(100) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`entity\` ADD CONSTRAINT \`entity_section_FK\` FOREIGN KEY (\`sec_type_id\`) REFERENCES \`section\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

}
