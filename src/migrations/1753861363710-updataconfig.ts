import { MigrationInterface, QueryRunner } from 'typeorm';

export class Updataconfig1753861363710 implements MigrationInterface {
  name = 'Updataconfig1753861363710';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`configuration\` ADD \`mismatch_reason\` varchar(31) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`configuration\` CHANGE \`status\` \`status\` enum ('UP', 'RADIO_OFF', 'DOWN', 'DOWNLOAD') NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`configuration\` ADD CONSTRAINT \`CHK_MISMATCH\` CHECK ((state <> 'MISMATCH' AND mismatch_reason IS NULL) OR (state = 'MISMATCH' AND is_ipv4(mismatch_reason) = 1))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`configuration\` DROP CONSTRAINT \`CHK_MISMATCH\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`configuration\` CHANGE \`status\` \`status\` enum ('UP', 'RADIO_OFF', 'DOWN') NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`configuration\` DROP COLUMN \`mismatch_reason\``,
    );
  }
}

