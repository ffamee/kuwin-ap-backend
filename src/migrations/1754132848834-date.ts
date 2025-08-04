import { MigrationInterface, QueryRunner } from "typeorm";

export class Date1754132848834 implements MigrationInterface {
    name = 'Date1754132848834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`accesspoint\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`accesspoint\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`section\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`section\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`entity\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`entity\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`building\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`building\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`building\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`building\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`entity\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`entity\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`section\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`section\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`accesspoint\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`accesspoint\` DROP COLUMN \`created_at\``);
    }

}
