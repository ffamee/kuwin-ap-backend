import { MigrationInterface, QueryRunner } from 'typeorm';

export class Check1754227160141 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`configuration\` ADD CONSTRAINT \`CHK_MISMATCH\` CHECK ((status <> 'MISMATCH' AND mismatch_reason IS NULL) OR (status = 'MISMATCH' AND mismatch_reason IS NOT NULL AND is_ipv4(mismatch_reason) = 1))`,
    );
    await queryRunner.query(
      `ALTER TABLE \`configuration\` ADD CONSTRAINT \`CHK_MAINTENANCE\` CHECK ((status <> 'MAINTENANCE' AND problem IS NULL) OR (status = 'MAINTENANCE' AND problem IS NOT NULL))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`configuration\` DROP CONSTRAINT \`CHK_MISMATCH\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`configuration\` DROP CONSTRAINT \`CHK_MAINTENANCE\``,
    );
  }
}

