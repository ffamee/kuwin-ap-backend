import { MigrationInterface, QueryRunner } from "typeorm";

export class Section1747116124513 implements MigrationInterface {
    name = 'Section1747116124513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`section\` (\`id\` int NOT NULL AUTO_INCREMENT, \`sec_type\` varchar(10) NOT NULL, UNIQUE INDEX \`IDX_b7a4df0706268224ac7065b4ff\` (\`sec_type\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_b7a4df0706268224ac7065b4ff\` ON \`section\``);
        await queryRunner.query(`DROP TABLE \`section\``);
    }

}
