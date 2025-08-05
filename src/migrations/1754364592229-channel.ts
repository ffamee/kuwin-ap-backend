import { MigrationInterface, QueryRunner } from "typeorm";

export class Channel1754364592229 implements MigrationInterface {
    name = 'Channel1754364592229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`configuration\` ADD \`channel\` int UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`configuration\` ADD \`channel_2\` int UNSIGNED NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`configuration\` DROP COLUMN \`channel_2\``);
        await queryRunner.query(`ALTER TABLE \`configuration\` DROP COLUMN \`channel\``);
    }

}
