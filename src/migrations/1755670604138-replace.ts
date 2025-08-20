import { MigrationInterface, QueryRunner } from "typeorm";

export class Replace1755670604138 implements MigrationInterface {
    name = 'Replace1755670604138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`model\` (\`id\` int NOT NULL AUTO_INCREMENT, \`model\` varchar(50) NOT NULL, \`pic\` varchar(100) NULL DEFAULT 'underconstruction.gif', \`lifecycleId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`lifecycle\` (\`id\` int NOT NULL AUTO_INCREMENT, \`group\` varchar(50) NOT NULL, \`end_of_life\` date NULL, \`end_of_service\` date NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`model\` ADD CONSTRAINT \`FK_2b1b175a9271c54dc0aea1f4cd9\` FOREIGN KEY (\`lifecycleId\`) REFERENCES \`lifecycle\`(\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`model\` DROP FOREIGN KEY \`FK_2b1b175a9271c54dc0aea1f4cd9\``);
        await queryRunner.query(`DROP TABLE \`lifecycle\``);
        await queryRunner.query(`DROP TABLE \`model\``);
    }

}
