# Node / Java 差分対応の作業分解 — Luna用

2026-10-23の追加計画: [上限100とJava update_taskの実装計画（Luna用）](implementation-plan-v20261023.md)。**計画のみ・未実行**。depthのNode/Java CLIとMCP、Java task更新を対象とし、進捗率の整数/小数方針は判断待ち。F-S5/F-S6や既存Gateの実装は含めない。

再自己レビューで5件の未達条件が見つかったため、[追加対応計画（Luna実行用）](self-review-followup-plan.md)に従いR2F-00〜07を完了した。下記のRPF完了表示は先行実行時の判定であり、再確認対象と今回の完了条件は追加計画を参照する。

状態: **元の75カード中37件完了、2件は人の判断待ち、36件は未着手。END-03はローカル草案まで完了。** RPF-00〜09完了。[自己レビュー修正計画](self-review-fix-plan.md)と[共有確認結果](../node-java-137-review-evidence-v20261022.md)を参照。R2F-00〜07ではbaseline、B26/F-J6分離、Java UID回帰、44件のNode/Java probe、final Java suite、closeoutを実施。R2F-06はimporter 12/12、Maven 229 tests (0 failure/error, 11 opt-in skips)、snapshot verifier 8/8。Node 20 parity 9/9はRPF-08の過去結果。Java implementation/version commit is HEAD `c0b4421`; R2F-02 assertion updates remain uncommitted. DEC-01/G-HELPとDEC-03/G-REPORTは採択待ち。DEC-02/G-PARENTとDEC-04/G-METAの提案は完了したが、APPLY-02 / APPLY-04前にGate判断が必要。DEC-10のfield別G-XMLとREF-01のG-REFERENCEも未採択。B23/F-S5、B24/F-S6、B25/F-J5、B26/F-J6は元の75カード外。F-J6は未着手将来候補で、R2Fでも実装しない。REM-01〜04、REM-06〜12、REM-16〜18は完了、REM-05は未再現のため保留、REM-13〜15は判断待ち。[採択判断パケット](../node-java-137-adoption-packet-v20261022.md)と[作業索引](task-index.md)を参照。

元資料は[機能・差分判断表](../node-java-feature-union-v20261022.md)。本計画は同表の後続候補F-N1 / F-J1〜F-J4 / F-S1〜F-S4 / F-X1を、一件ずつ実行・確認できる75作業カードへ分解したもの。差異維持の行は維持理由と確認結果を残し、機能追加の作業へ置き換えない。実行中に見つかった追加差異は、元のカード数と分けて記録する。

## 残作業から再開する場合

自己レビュー4指摘の修正は[修正計画（Luna実行用）](self-review-fix-plan.md)に従い、ユーザーの明示許可を受けてRPF-00〜09を完了した。END-01/02/03、Issue草案、両repo trackingと最終diff/statusを整合した。未決定のF-S5/F-S6や既存Gateは採択していない。

残作業は[実行計画](remaining-work.md)を参照する。Java全体確認とF-J5修正、reader復旧、END-03報告草案、RPF-08確認を完了した。未解決のREM-13〜15とAPPLY / REF / V1は、人の判断・既存Gateが揃ってから既存カードを使う。元の75カードと補充18カードは別集計とする。

元の推奨順のうち、確認の正常化・F-J5修正・採択資料作成・END-03報告は完了した。採択された範囲の反映→reference更新→v1 sliceは、maintainer判断と既存Gateを受けて続ける。

## 読む順序と作業の指定

1. 本書の共通手順と確認コマンドを読む。
2. [全作業索引](task-index.md)で対象ID、依存、判断待ちを確認する。
3. 指定されたIDのカードと、そのカードが参照する比較表の行・sourceだけを読む。
4. 明示された実行指示の範囲で、依存を満たすカードを進める。仕様判断と既存Gateの人による承認は代行しない。

| 作業列 | カード | 用途 |
| --- | --- | --- |
| 調査・判断 | PRE、KEEP、DEC、END-01、END-03 | 根拠・再現・判断案・追跡を揃える。#137の調査成果の更新に使う |
| legacy修正候補 | LEG、APPLY | 共通契約に必要と確認した修正と意味のある回帰。APPLYは対応する仕様決定後に実施する |
| v1後続 | REF、V1 | 既存Gate G5計画の詳細化。P5-C1承認や参照identity等の依存がある |
| 統合確認 | END-02 | 実際に変更した作業列の最終確認。調査だけの完了時は製品testを増やさない |

実装カードを作成したことは、その修正やv1全実装を#137の調査完了条件へ追加する意味ではない。#137では判断と後続追跡を揃え、実装の完了は対応先の作業として記録する。

## 共通前提

| 記号 | checkout / 相対pathの基準 |
| --- | --- |
| Node | `/Users/igapyon/Documents/git/miku-project` |
| Java | `/Users/igapyon/Documents/git/miku-project-java` |
| Java production | `src/main/java/jp/igapyon/mikuproject/` |
| Java tests | `src/test/java/jp/igapyon/mikuproject/` |
| Java v1 corpus | 採用済みimmutable snapshotの`testdata/conformance/v1/` |

開始時の既知状態は比較表の冒頭に固定済み。Nodeのpackage/lockfileとJavaのPOMには別作業の`1.1.2`変更がある。README/TODO/比較表にも既存の未commit変更がある。これらを消したり、作業前のclean化のためにreset/stash/restoreしたりしない。別作業のversion整合修正をこの計画へ混ぜない。

各カードの共通手順:

1. 対象repositoryで`git status -sb`を読み、依存カードの結果を確認する。
2. 「入力・変更範囲」にあるsourceと既存testを読む。比較表の「差異維持」「仕様判断」の例外を先に確認する。
3. 修正候補は、指定caseで現状を再現してから共通契約に照らす。再現しない場合はテストを偽って失敗させず、現状と根拠を記録する。意図的な例外が判明したら実装を広げず判断表を更新する。
4. 一件のカードを完了してから次へ進む。失敗時は同じ境界を直し、無関係なCLI・schema・依存versionを変更しない。
5. 指定されたfocused確認を行い、exit / stdout / stderr / 生成物を別に記録する。skip、未実施、環境不足をpassへ数えない。
6. 実際に変えたsource、根拠、確認結果を既存tracking docsと比較表へ反映し、`git diff --check`、最終diff、`git status -sb`を確認する。

Nodeの`src/js/`は生成物。TypeScriptを変更したカードだけ`npm run build:core`で再生成する。Java productionはJava 8互換を保ち、既存のtest-side helperをproductionから呼ばない。Node test fileを新設する場合はsuite topologyへ登録する。本計画は主に既存test fileの拡張を使う。

v1のfixture/goldenは採用snapshotを直接読み、Java固有のgoldenへ複製しない。現在のNode出力からv1の期待値を作り直さない。frozen `v1.0.3`、G4 lock、legacy subtreeをこの計画の都合で上書きしない。

## 成果の記録形式

各カードの結果は、該当repositoryの既存worklogへ次の項目で残す。実行ログ等は`workplace/node-java-137/<task-id>/`へ置き、追跡文書には要点を記録する。

```text
task_id:
state: done | awaiting-decision | blocked | failed
repository / branch / HEAD:
baseline_source_changes:
input_cases:
observed_before:
decision_and_source:
changed_files:
checks: command, exit, test count, failures, errors, skipped
artifact_or_output_observation:
union_rows_updated:
next_ready_task_or_exact_missing_input:
```

仕様判断の記録は`docs/node-java-137-decisions.md`（Node、新規予定）へ、対象行・根拠・選択肢・推奨案・影響・決定者・決定日・状態を残す。人がまだ決めていない欄は`未決定`とする。Lunaが調査しただけで`承認済み`と書かない。

## 確認コマンドのカタログ

**以下は将来の実行用。計画作成時には実行していない。** `<...>`はカードに指定した値へ置換する。既存の成功ログを新しい実行結果として転記しない。

| ID | cwd | 確認方法 |
| --- | --- | --- |
| DOC | 対象repo | `git diff --check`、参照先の存在、比較表行IDとカードIDの対応、最終diff。製品testなし |
| N-FOCUS | Node | `TZ=Asia/Tokyo node ./node_modules/vitest/vitest.mjs run <カード記載のtest file>` |
| N-FULL | Node | `npm run build:full`。Nodeのコード・CLI統合を変更した作業列の完了時に一度実施 |
| J-FOCUS | Java | `mvn -B -Dtest=<カード記載のclass名をカンマ区切り> test`。新規予定classは作成後に指定し、test件数0を成功扱いしない |
| J-ALL | Java | `sh scripts/test-all.sh`。importer Node tests→全Java tests→snapshot再検証を含む |
| J-PARITY | Java | `MIKUPROJECT_RUN_NODE_PARITY=true mvn -B -Dmiku.project.node.binary=<Node実行fileの絶対path> -Dtest=MikuprojectNodeParityTest test`。記録済み成功環境はNode 20.20.2。system Node 26の不一致はREM-04で原因調査する。opt-in testの実行件数/skipとtoolchainを記録 |
| SNAPSHOT | Java | `node --test scripts/import-miku-project-contract-snapshot.test.mjs`と`mvn -B -Dtest=ContractSnapshotVerifierTest,ConformanceSuiteLoaderTest test` |
| V1-FOCUS | Java | J-FOCUSでカード記載のv1 classと`ContractSnapshotVerifierTest`を指定。review単位の終わりには既存P5方針に従いJ-ALLも行う |

依存が未導入なら、実行時に既存Setupの`npm ci`、Java側parity用の`npm --prefix vendor/mikuproject ci`の要否を確認する。インストールやnetwork利用が環境の承認対象なら、その時点の許可手順に従う。toolchain自体を更新してtestを通す作業は含めない。

legacy fixture共通名はPRE-02で作る。`BASE`はNodeのworkbook diff testの`document()`と同じ六sheetの小さなdocument、`STATE`はJavaの`vendor/mikuproject/testdata/hierarchy.xml`起点のCLI用state、`PATCH_OK`は`{"operations":[{"op":"update_project","fields":{"name":"Updated project"}}]}`、`UNKNOWN`はTasksへの`AgentNote`列と`CustomData` sheet追加。v1にこれらのlegacy fixtureを流用しない。

## 判断・Gateの一覧

| 待ち条件 | 必要な記録 | 解除対象 |
| --- | --- | --- |
| G-HELP | DEC-01のlegacy help/option位置の決定 | APPLY-01 |
| G-PARENT | DEC-02の親directory作成方針 | APPLY-02 |
| G-REPORT | DEC-03のJava帳票optionと対象commandの決定 | APPLY-03 |
| G-META | DEC-04の凍結metadataに対するJava側方針 | APPLY-04 |
| G-XML | DEC-10のfieldごとの採否・loss契約 | APPLY-05の指定field |
| G-REFERENCE | REF-01のexact source/tagとscopeの採択でREF-02を開始。REF-02で生成・検証したmanifest/outer-lock digestの採択後にREF-03を開始 | REF-02/03、参照するv1作業 |
| G-P5-C1 | 既存計画のP5-C1再reviewと人の承認。REF-05で根拠をまとめる | V1-01以降の新command作業 |
| G-P5-D | V1-21のserviceで比較可能なcross-runtime意味/契約と差分承認。asset起動caseはP5-Eへ引き継ぐ | V1-22以降の配布・launcher作業 |
| G-G5 | V1-27の人によるGate G5承認 | G5完了という記録。承認までは未完を維持 |

上記の仕様決定待ちは比較表の未解決事項を明示したもの。P5-C1/G5等は[既存計画](../miku-project-zero-base-implementation-plan-v20260810.md#実行順とreview-gate)に由来する。記録済みの決定・承認は再要求せず、対象・内容・前提が同じかを確認して再利用する。

## 将来Lunaへ渡すときの指定例

```text
docs/node-java-work-plan-v20261022/README.md と task-index.md を読み、
対象ID: <指定する一件または明示した範囲>
作業列: <調査・判断 / legacy修正候補 / v1後続>
を実行する。
依存と採用済みの判断を確認し、指定した範囲だけを進める。
未決定の仕様を推測して実装しない。差異維持は維持理由を残す。
終了時にtask_id、観測、変更、確認、未完条件を共通形式で報告する。
```

この指定例は将来用であり、現在の実行指示ではない。

## 比較表の追跡先

END-01 / RPF-07のhistorical comparison tableは90行。R2F-01でB26を追加し、現在のfeature unionは91行（C22 / E07 / B26 / D12 / V16 / R08）。元の75 task cardsとREM-18には加算しない。

| 比較表の行 | 主なカード |
| --- | --- |
| C01-C07 | LEG-J14、LEG-N01、LEG-J09-LEG-J11、DEC-04 |
| C08-C11 | LEG-J01-LEG-J11、LEG-J15 |
| C12-C15 | LEG-J12、LEG-J16、KEEP-02 |
| C16-C22 | LEG-J17、KEEP-03、DEC-03 |
| E01-E07 | KEEP-01 |
| B01-B02、B05-B06 | KEEP-01 |
| B03 | DEC-01、APPLY-01 |
| B04 | LEG-N01 |
| B07、B15 | LEG-J12 |
| B08-B12 | LEG-J06-LEG-J10 |
| B13 | DEC-04、APPLY-04 |
| B14 | LEG-J11 |
| B16 | LEG-J05、DEC-02、APPLY-02 |
| B17 | DEC-03、APPLY-03 |
| B18-B20 | LEG-J01-LEG-J05、LEG-J11 |
| B21 | LEG-J13 |
| B22-B23 | LEG-J14。B23の判断は実行中に発見したF-S5として記録 |
| B24 | LEG-J15。判断は実行中に発見したF-S6として記録 |
| B25 | LEG-J16。修正候補は実行中に発見したF-J5として記録 |
| B26 | R2F-01 / R2F-03。Java `update_task`の未対応を独立候補F-J6として記録 |
| D01-D05、D09-D11 | KEEP-02、LEG-J01-LEG-J03、LEG-J14-LEG-J17 |
| D06 | KEEP-03 |
| D07 | KEEP-04 |
| D08 | DEC-05-DEC-10、APPLY-05 |
| D12 | KEEP-05 |
| V01、V09-V10 | REF-01-REF-04、V1-21 |
| V02-V03 | V1-01-V1-07 |
| V04 | V1-04、V1-08-V1-10 |
| V05 | V1-11-V1-18 |
| V06 | V1-11、V1-19-V1-20 |
| V07-V08、V12 | V1-02-V1-03、V1-22-V1-25 |
| V11 | V1-21 |
| V13-V16 | KEEP-05、V1-22、V1-27 |
| R01-R08 | PRE-01、KEEP-05、REF-01、V1-22-V1-27 |

この対応表の「維持するだけ」の行にも、根拠と確認を担当するカードがある。全行を実装修正へ割り当てる必要はない。
