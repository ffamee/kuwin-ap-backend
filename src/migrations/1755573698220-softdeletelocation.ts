import { MigrationInterface, QueryRunner } from "typeorm";

export class Softdeletelocation1755573698220 implements MigrationInterface {
    name = 'Softdeletelocation1755573698220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` ADD \`deleted_at\` datetime(6) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`location\` DROP COLUMN \`deleted_at\``);
    }

}
