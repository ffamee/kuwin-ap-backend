import { MigrationInterface, QueryRunner } from "typeorm";

export class Modelindex1755663582398 implements MigrationInterface {
    name = 'Modelindex1755663582398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX \`IDX_3e204421faf636bc3c66504c96\` ON \`accesspoint\` (\`model\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_3e204421faf636bc3c66504c96\` ON \`accesspoint\``);
    }

}
