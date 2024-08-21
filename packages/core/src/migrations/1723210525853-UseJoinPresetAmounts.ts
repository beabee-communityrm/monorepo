import { MigrationInterface, QueryRunner } from "typeorm";

export class UseJoinPresetAmounts1723210525853 implements MigrationInterface {
  name = "UseJoinPresetAmounts1723210525853";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Change periods to presetAmounts
    await queryRunner.query(`
        UPDATE content
        SET "data"=jsonb_set(
            "data",
            '{presetAmounts}',
            jsonb_build_object(
                'monthly', jsonb_path_query_first(
                    "data"->'periods',
                    '$[*] ? (@.name == "monthly").presetAmounts'
                ),
                'annually', jsonb_path_query_first(
                    "data"->'periods',
                    '$[*] ? (@.name == "annually").presetAmounts'
                )
            )
        ) - 'periods' WHERE "id"='join'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE content
        SET "data"=jsonb_set(
            "data",
            '{periods}',
            jsonb_build_array(
                jsonb_build_object(
                    'name', 'monthly',
                    'presetAmounts', "data"->'presetAmounts'->'monthly'
                ),
                jsonb_build_object(
                    'name', 'annually',
                    'presetAmounts', "data"->'presetAmounts'->'annually'
                )
            ),
            true
        ) - 'presetAmounts' WHERE "id"='join'
    `);
  }
}
