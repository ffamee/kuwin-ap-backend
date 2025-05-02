import { MigrationInterface, QueryRunner } from "typeorm";

export class Edit1746084837937 implements MigrationInterface {
    name = 'Edit1746084837937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`UC_username\` ON \`user\``);
        await queryRunner.query(`ALTER TABLE \`zone\` ADD UNIQUE INDEX \`IDX_71d9239a0d38a70bc11b27adb2\` (\`latitude\`)`);
        await queryRunner.query(`ALTER TABLE \`zone\` ADD UNIQUE INDEX \`IDX_4f5d6e5b96940bd46327de4ea0\` (\`longtitude\`)`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`)`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`password\` \`password\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`password\` \`password\` varchar(255) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\``);
        await queryRunner.query(`ALTER TABLE \`zone\` DROP INDEX \`IDX_4f5d6e5b96940bd46327de4ea0\``);
        await queryRunner.query(`ALTER TABLE \`zone\` DROP INDEX \`IDX_71d9239a0d38a70bc11b27adb2\``);
        await queryRunner.query(`CREATE UNIQUE INDEX \`UC_username\` ON \`user\` (\`username\`)`);
    }

}
