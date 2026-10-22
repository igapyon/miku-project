# 自己レビュー4指摘の修正計画 — Luna実行用

作成日: 2026-10-22。状態: **完了（RPF-00〜09実行済み）。** Lunaがユーザーの明示許可に基づき実施した。初版にあった「計画のみ」「実行許可ではない」という文言は今回の許可より前の状態であり、現状を示さない。

この計画は、自己レビューで見つかった次の4指摘を解消する。元の75カード・補充REM-01〜18とは別集計とする。実行開始前の記録は元75件が37完了・2判断待ち・36未着手だが、一部の完了根拠は今回の再確認対象である。

| 指摘 | 問題 | 担当カード | 解消の条件 |
| --- | --- | --- | --- |
| RV-1 | 比較表にJava修正前の記述が残る | RPF-06 / 07 / 09 | 元の固定revisionと現在worktreeを区別し、全比較行の状態・判断・次対応が現在の根拠と一致 |
| RV-2 | F-S5/F-S6の資料に既存の消去規則・日時補完規則が不足 | RPF-04 / 05 / 09 | 入力・出力・経路・fieldごとの根拠表があり、既存仕様と未決定事項を区別 |
| RV-3 | XLSX欠落・未知・重複見出しの規則と確認が不足 | RPF-02 / 03 | 現状規則を明記し、public import APIの境界回帰とnative列保持確認が成功 |
| RV-4 | 旧flat command拒否testが構造化診断を検査しない | RPF-01 | 6commandすべてでtext/JSONの拒否、command/code、一件のerrorを検査 |

## 実行範囲と前提

| 記号 | checkout / pathの基準 |
| --- | --- |
| Node | `/Users/igapyon/Documents/git/miku-project` |
| Java | `/Users/igapyon/Documents/git/miku-project-java` |
| J-MAIN | Javaの`src/main/java/jp/igapyon/mikuproject/` |
| J-TEST | Javaの`src/test/java/jp/igapyon/mikuproject/` |
| 共有の確認結果 | Nodeの`docs/node-java-137-review-evidence-v20261022.md`。RPF-00で新設する |
| 生ログ・一時資料 | 対象repoの`workplace/node-java-137/<RPF-ID>/`。Git管理へ加えない |

- [共通手順](README.md)と本書を読む。既存dirty変更、別依頼の`1.1.2` version変更を保持する。reset / stash / restoreで開始状態を作らない。
- この修正列の製品production変更は原則不要。Javaのtest、Node/Javaの追跡文書とローカル草案を修正する。新しい機能差・既存仕様違反が見つかったら、根拠と個別の対応候補を記録する。未決定の意味を新しい共通仕様として実装しない。
- G-HELP / G-PARENT / G-REPORT / G-META / field別G-XML / G-REFERENCE、REM-13〜15、REF/V1の採択・実装は本計画へ含めない。
- Node20は今回の比較用toolchain。Nodeの製品support rangeを決めた意味にはしない。snapshot、golden、G4 lock、vendor、依存versionは変更しない。
- Java checkoutへの書込権限が実行環境で不足する場合は、正式な書込承認を使う。既存変更を別copyで上書きしない。
- commit / push / GitHub投稿・Issue登録は本計画に含めない。RPF-09はローカル草案の引渡しまで。

## 順序と依存

Lunaは下表の順に一枚ずつ実行する。依存未完のカードを完了にしない。一枚の失敗で、依存しない根拠調査まで止めない。

| ID | 内容 | 依存 | 状態 |
| --- | --- | --- | --- |
| [RPF-00](#rpf-00) | baselineと証拠記録を作る | なし | 完了 |
| [RPF-01](#rpf-01) | 旧command拒否のJSON診断testを補強 | RPF-00 | 完了 |
| [RPF-02](#rpf-02) | XLSX見出し規則をsourceと公開APIから固定 | RPF-00 | 完了 |
| [RPF-03](#rpf-03) | XLSX見出し境界とnative列の回帰を追加 | RPF-02 | 完了 |
| [RPF-04](#rpf-04) | F-S5の入力・出力・patch意味を整理 | RPF-00 | 完了 |
| [RPF-05](#rpf-05) | F-S6の日時・field・経路表を整理 | RPF-00 | 完了 |
| [RPF-06](#rpf-06) | 修正済みCLI / 境界行を現状へ更新 | RPF-01 / 03 / 04 / 05 | 完了 |
| [RPF-07](#rpf-07) | 全比較行と根拠リンクを監査 | RPF-06 | 完了 |
| [RPF-08](#rpf-08) | Java全体・共有parityを最終確認 | RPF-01 / 03 / 04 / 05 | 完了 |
| [RPF-09](#rpf-09) | 完了記録・採択資料・報告草案を整合 | RPF-07 / 08 | 完了 |

<a id="rpf-00"></a>

### RPF-00 baselineと証拠記録

入力: 両repoのstatus / branch / HEAD、既存[残作業計画](remaining-work.md)、[判断記録](../node-java-137-decisions.md)、[採択資料](../node-java-137-adoption-packet-v20261022.md)、既存END-02/03結果。

手順:

1. 各repoで`git status -sb`、`git rev-parse HEAD`、`git diff --stat`を取得する。変更前からあるpathと今回触るpathを記録する。
2. `/opt/homebrew/opt/node@20/bin/node --version`、`java -version`、`mvn -version`を記録する。Node20実行fileが無い場合は推測した別pathで比較を進めず、不足条件を記録する。Node26の過去不一致は別のREM-05保留として維持する。
3. 共有の確認結果文書を新設し、各RPFの見出しを置く。各結果に「入力case / source / 観測またはsource由来 / 変更path / command / exit / test数・failure・error・skip / 未解決」を記録する。
4. `remaining-work.md`のREM-03、REM-06、REM-09/10/12、REM-18に「自己レビュー再確認中・対応RPF」を記す。REM-07/08の正常case成功と、RV-3の未確認境界を区別する。完了済み実装自体を未実装と書き戻さない。
5. END-01/02/03には現在の再確認状態を追記する。元75カードの状態を変えた場合はtask-index実データから再集計し、旧37件という数字を手入力で使い回さない。

完了: 既存dirty変更と今回scope、実際のtoolchain、各指摘の再確認先が一つの記録から辿れる。新規RPFは元75件・REM18件に加算されていない。

確認: DOCのみ。baseline確認のために全testを再実行しない。

<a id="rpf-01"></a>

### RPF-01 旧flat command拒否testを補強（RV-4）

変更先: `J-TEST/cli/MikuprojectCliTest.java`の`rejectsLegacyFlatCommands` / `assertUnknownCommand`。既存の`CoreApiAiJsonUtil`をJSON parseへ使う。productionは`MikuprojectCli.inspectInvocation`、`structuredUsageError`、`errorDiagnostics`を読むだけ。

対象は次の6commandを省略せず確認する: `validate-xml`、`export-ai-json-spec`、`export-xlsx`、`export-wbs-xlsx`、`export-report-bundle`、`export-xlsx-batch`。

手順:

1. 既存text拒否確認を維持する。exit 2、stdoutが空、`usage error:`が一件、対象command名が含まれることを検査する。messageの日本語全文やhelp本文は固定しない。
2. 各commandを`{command, "--diagnostics", "json"}`でも実行する。modeごとに新しいCLI / stdout / stderrを用意する。
3. stderr全体を**単一のJSON object**としてparseし、次をassertする: `ok=false`、`status="error"`、`exit_code=2`、`command`と`context`が対象commandと完全一致、`error_code="unsupported_command"`、`error_count=1`、`errors`が一要素、その`code="unsupported_command"`、`warning_count=0`、`warnings`が空。
4. JSON modeでもstdoutが空であることを検査する。存在しない`error_type`等のfieldを新たに要求しない。

確認（cwd=Java）:

```sh
mvn -B -Dtest=MikuprojectCliTest#rejectsLegacyFlatCommands test
mvn -B -Dtest=MikuprojectCliTest,MikuprojectCliRegressionTest test
```

完了: 6commandがtext/JSON両方で検査され、wrong code・wrong command・error二件・command受理のいずれでもtestが失敗するassertionがある。REM-03へ実際の結果を反映する。

<a id="rpf-02"></a>

### RPF-02 XLSX見出し規則を確定して記録（RV-3の根拠）

読むsource:

- Java `J-MAIN/projectxlsx/ProjectXlsxImportEntities.java`、`ProjectXlsxImport.java`、`ProjectXlsxImportUtil.java`。
- Java `J-MAIN/projectworkbookjson/ProjectWorkbookSchema.java`、`ProjectWorkbookJsonValidate.java`、`ProjectWorkbookJsonImport.java`。
- Node `src/ts/project-xlsx-import-util.ts`の`readHeaderMap`、`project-xlsx-import-entities.ts`、`project-workbook-schema.ts`。
- Java `J-TEST/projectxlsx/ProjectXlsxTest.java`、`J-TEST/coreapi/CoreApiWorkbookTest.java`の既存native拡張値assertion。

手順:

1. Tasks / Resources / AssignmentsのNode共通header、Java-only header、Java側対応fieldを一覧にする。Calendars / NonWorkingDays / Projectの別処理を記録し、今回のgeneric importer対象へ含めない。
2. 次表をJavaについてsourceで再確認し、現在規則として記録する。これは今回のsourceに見える挙動であり、新しい共通仕様の採択ではない。

| case | 現在Javaで確認すべき規則 | 次のtestの要点 |
| --- | --- | --- |
| known headerの並べ替え | header名の完全一致で読み取る | 値の混入・欠落なし |
| 一部known headerが欠落 | そのkeyを生成しない | replaceのdefaultとmergeの既存値保持を区別 |
| unknown headerがknownと混在 | unknownを対応表に入れない | known値へ流用しない |
| 同名known headerが複数 | 最初の一致を採る | 異なる値のどちらが入るか明示 |
| header行の既知labelがゼロ | Java native列順で位置対応へfallback | 一部knownありのcaseと混ぜない |
| 既知headerはあるがUIDが無い | UID無しrowを下流importerがどう扱うか確認 | replace / merge双方で明記 |
| 読取対象cellがrow末尾に無い | `readCell`のnullを下流がどう扱うか確認 | 他列の値で補わない |

3. warning/errorの有無を公開API・CLIで確認可能な範囲と結びつける。APIにheader warningの戻り値が無ければ、その事実を明記する。「既存validatorが拒否する」と推測しない。
4. Nodeは重複headerでMapの後勝ち、Javaは現在先勝ちである点をsourceで照合する。差を消す目的でproductionを変更しない。
5. 公開contractが現状と衝突する箇所があれば、引用箇所と実際の経路を残し、該当規則だけ判断待ちにする。新しい例外・error code・header alias・trim/case変換を勝手に追加しない。

完了: 欠落・未知・重複・fallback・identityの規則、公開診断の有無が共有確認結果に明記され、RPF-03の期待値が一意になる。判断待ちがあればそのcaseだけを明示する。

確認: DOC。private helperの動きを写すtestは作らず、public APIの観測結果を次カードで検査する。

<a id="rpf-03"></a>

### RPF-03 XLSX境界回帰を追加（RV-3の確認）

変更先: 既存`J-TEST/projectxlsx/ProjectXlsxTest.java`。必要なpublic facade確認だけ`J-TEST/coreapi/CoreApiWorkbookTest.java`へ追加する。`ProjectXlsxImportEntities`のprivate methodを直接testしない。

fixture作成: 既存sample / hierarchy modelと`exportProjectWorkbook`を使う。各caseをfresh workbookで作り、header行indexとdata開始indexは`ProjectWorkbookSchema`定数を使う。column移動はheaderとdataを同時に行い、未知列・欠落・重複だけを操作するcaseとは分ける。

| test case | 入力操作 / 値 | assert対象 |
| --- | --- | --- |
| H01 native保持 | Java native workbookをimport。既存のType / Priority / cost / variance等の値assertionを再利用 | Java-only列と共通列の値。列数一致だけでは完了にしない |
| H02 Tasks並べ替え | `CalendarUID="1"`、`Notes="NOTES-SENTINEL"`。既存reorder testを定数・明示値で維持 | calendarとnotesが各fieldへ入る |
| H03 Resources並べ替え | `Initials="I-SENTINEL"`、`Group="G-SENTINEL"`、native `Cost=123.5`を列移動 | 三値が対応fieldに保持される |
| H04 Assignments並べ替え | `Work="PT5H0M0S"`、`ActualWork="PT2H0M0S"`、native `Cost=321.5`を列移動 | 三値が混ざらず保持される |
| H05 optional欠落 | TasksのNotes列をheader/dataから除去。base modelには`KEEP-NOTES` | replaceの現在default、mergeの`KEEP-NOTES`保持を別assertion |
| H06 unknown挿入 | known列間へ`CustomColumn`と`UNKNOWN-SENTINEL`を挿入 | known列値にsentinelが混入せず、正常値が保持される |
| H07 重複 | Notesを二列作り`FIRST-NOTES` / `SECOND-NOTES` | RPF-02で確認した選択値をpublic結果で検査。未知の共通policyを追加しない |
| H08 既知labelゼロ | dataと列位置を保ってheader labelだけを空にする | 現在の位置fallbackでnative値が保たれる |
| H09 identity欠落 / short row | UID列欠落case、末尾cell欠落caseを別入力で作る | RPF-02の公開API規則どおり。正常な別rowを巻き込まない |

H03/H04はgeneric importerを共有する三sheetへの確認であり、Taskだけの成功を全sheetへ外挿しない。H05〜H09の再現と既存契約が衝突した場合は、誤った現状を新たな互換contractとして固定せず、根拠・実測・必要な個別修正案を記録して当caseを保留する。

確認（cwd=Java）:

```sh
mvn -B -Dtest=ProjectXlsxTest,CoreApiWorkbookTest test
```

完了: 対象のpublic値assertionが成功し、header policyとtestの対応表がある。productionを変えていないことも記録する。追加後のtest件数を取得し、旧22件を転記しない。REM-06 / 07 / 08の境界確認状態を更新する。

<a id="rpf-04"></a>

### RPF-04 F-S5の既存入力規則とprojection出力を分ける（RV-2）

読むsource:

- Node `docs/miku-project-ai-json-spec.md`の`update_task.notes` / `calendar_uid`（現行474〜476行付近）。
- Node `src/ts/project-patch-json-updates.ts`、`msproject-ai-views.ts`。
- Java `J-MAIN/msprojectxml/MsProjectAiViews.java`、`projectpatchjson/ProjectPatchJsonCore.java`のop dispatch、`ProjectPatchJsonTasks.java`、`ProjectPatchJsonUpdates.java`、関連既存tests。
- [判断記録](../node-java-137-decisions.md)のB23、既存LEG-J14結果、参照済みMCP / Skills consumer。

手順:

1. `notes`と`calendar_uid`について、**projection output**と**update_taskのfields input**を別表にする。省略・null・空文字・値あり・型不正・未知calendar UIDを行に置く。
2. 各cellに「仕様記載」「Node実装」「Java実装」「既存test/観測」「未確認」を記す。Javaが実際に`update_task`へdispatchしているかを最初に確認し、文字列検索でfield名が見つかっただけで対応済みにしない。
3. 既存仕様の空文字=消去、Nodeの省略=変更しない、null=型不正warningの経路をsourceと結びつける。Javaの結果は実装を追って記録し、Nodeと同じと推測しない。
4. `task-edit` / bundleの未設定field出力形が未決定である点は維持する。Patch入力規則まで新規に採択する提案から外し、projection変更が編集生成へ与える影響を具体化する。
5. 新しい実装不足が判明したら、そのop/field・根拠・受入caseを別の後続候補として記録する。このカードではproductionへ追加入力対応を実装しない。
6. 判断記録と採択資料のF-S5を更新する。未確認consumerは未確認と書き、資料完成を採択と数えない。

完了: 「既に決まっている入力意味」「現状のruntime差」「未決定のprojection表現」が別々に読める。field別の変更対象と互換影響があり、REM-09 / 12の完了根拠を更新できる。

確認: DOC。既存fixture/testが支える範囲を明示し、source由来の表を新しい実測結果と呼ばない。

<a id="rpf-05"></a>

### RPF-05 F-S6をfield・経路・task種別へ分解（RV-2）

読むsource:

- Node AI JSON specの通常taskの勤務時間補完とmilestone例外（現行591〜595行付近）。この記載は新規生成モードの文脈で読む。
- Node `src/ts/msproject-ai-views.ts`、`project-patch-json-util.ts`、`project-patch-json-updates.ts`、`project-workbook-json-import.ts`、`project-xlsx-import-entities.ts` / `project-xlsx-import-project.ts`。
- Java `J-MAIN/msprojectxml/MsProjectAiViews.java`、`projectworkbookjson/ProjectWorkbookJsonImport.java`の`importTaskRowsAsProjectModel` / `normalizeDateTime`、`projectpatchjson/ProjectPatchJsonUtil.java` / `ProjectPatchJsonCore.java`。
- Java `J-TEST/cli/MikuprojectNodeParityTest.java`のstate/exchange比較、`J-TEST/msprojectxml/MsProjectAiViewsTest.java`と既存patch tests。

作る表:

| 軸 | 必須の行・列 |
| --- | --- |
| 入口 / 出口 | from-draft、workbook import、summarize、apply-patch、workbook-json export、XLSX import |
| field | Project StartDate / FinishDate、Task Start / Finish、milestone date、Task notes/calendar UID、既存で差が出たblank Project/Calendar cell |
| task種別 | 通常task、summary、milestone。Project fieldとtask fieldを混ぜない |
| 入力値 | date-only、明示local datetime（space / T）、null、空文字、patch field省略 |
| 根拠 | 既存仕様の適用範囲、最初に値が変わる関数、Node値、Java値、観測済み/ソース由来/未確認 |

手順:

1. LEG-J15のfrom-draft→state→summarize/apply-patchの流れを追い、時刻が初めて付く位置を特定する。draft生成時の補完と、既存workbookを読む時の補完を区別する。
2. 既存specの通常task補完とmilestone非補完を根拠表へ入れる。新規生成モードのルールをProject fieldや全workbook importへ自動拡張しない。
3. Javaでmilestone判定前にStart/Finishをnormalizeする経路と、既存parityのmilestone時刻差を結びつける。これだけで全date-onlyが不具合／正しいと断定しない。
4. date-onlyから時刻追加という意味差、space/Tの字句差、null/空文字、patch省略/消去を別項目へ分ける。正常日時の同値性を日付精度の一致と呼ばない。
5. 採択資料のA/B/C案に対象の入口・field・task種別を付ける。Javaの09:00/18:00をすべてのfieldへ適用する案を一括提示しない。
6. 既存仕様違反候補があれば、個別のfield・source・受入caseとして残す。今回の資料修正で時刻/nullをnormalizeしない。

完了: 入力精度と変換経路を追える表があり、既存仕様の適用範囲と残る判断が明確。REM-10 / 12の再完了根拠を記録できる。

確認: DOC。必要な追加観測は既存の小fixtureだけで行い、採択前の期待値をgoldenへ追加しない。

<a id="rpf-06"></a>

### RPF-06 修正済み行を現在状態へ更新（RV-1）

変更先: Node `docs/node-java-feature-union-v20261022.md`、共有確認結果、`docs/migration-worklog.md`。

最初に更新する行と照合先:

| 行 | source / 確認先 | 記録する現在状態 |
| --- | --- | --- |
| C07 / B14 | Java validation report経路、LEG-J11、regression test | processing failureのprimary reportとusage failureのstderrを区別 |
| C10 / B18 / B20 | ProjectWorkbookJsonDiffTest、LEG-J01〜05 | 「回帰未追加」を残さず、追加済みcaseと未確認だけを明示 |
| C12 / C15 / B25 / F-J5 | F-J5実装、RPF-02/03 | header対応済み・native保持・確認境界。C15の誤参照F-J3をF-J5へ訂正 |
| B07 / B15 | binary I/O guard、LEG-J12、regression | 個別code / I/O metadataの現在挙動と未確認case |
| B09 | single-stdin guard、LEG-J07 | guard無しという旧記述を現在実装へ更新 |
| B10 | depth字句検査、LEG-J08 | 負数/小数/文字列拒否は実装済み。上限だけ未決定 |
| B11 | draft/patch extractor、LEG-J09 | fenced受理を現在経路に更新 |
| B12 | detect-kind失敗、LEG-J10 | primary無し・exit1を現在状態として記録 |
| B19 | 診断回帰、RPF-01 | 確認済みfield・codeを記し、全diagnostics byte一致へ拡大しない |
| B21 | UTF-8 entrypoint、LEG-J13 | mainでUTF-8出力する現状。呼出し側PrintStreamとOS改行の確認範囲は明示 |
| B23 / F-S5 | RPF-04 | 既存Patch入力規則と未決定projection形を区別 |
| B24 / F-S6 | RPF-05 | 日時・空cell・task種別・経路を分けた判断 |
| F-J1 / F-J2 / F-J5 | 最新focused / J-ALL結果 | 旧failure記録は履歴とし、現在結果と矛盾させない |

手順: 各行を「調査時の固定revision」「今回の未commit worktree」「根拠」「次対応」で読み分けられるようにする。既存の固定commitリンクはbaselineの根拠として保持し、未commit修正の現在証拠には共有確認結果・worklogを追加する。未commitのsourceを固定commitに入っていると記載しない。

この時点でRPF-08が未実行なら、今回の全体確認はpendingと記す。以前の225件成功を新しいtest/sourceでの成功として転記せず、RPF-09でRPF-08の実測結果へ更新する。

完了: 上表の行に「未実装なのに完了」「実装済みなのに不足」という矛盾がない。既存判断待ちは未決定のまま残り、runtime差を消すことを更新の目的にしない。

確認: DOC。既存IDと表構造を保持し、source/testに無い結果を追加しない。

<a id="rpf-07"></a>

### RPF-07 全比較行・参照の監査（RV-1の取りこぼし防止）

入力: 全比較表（現在90行）、RPF-06結果、元task-index、共通worklog。

手順:

1. C / E / B / D / V / Rの機能行すべてを安定IDで列挙し、Node状態、Java状態、判断、次対応、根拠を一行ずつ確認する。F-*は後続作業一覧として別に確認する。
2. 共有確認結果に監査表を置く: `row_id | baseline/currentの別 | evidence | judgment | next_action | audit_result`。sourceが無い行をdoneにしない。
3. 「source上のみ」「今後確認」「回帰未追加」「修正候補」を検索し、今も正しい残件だけを残す。v1未着手をlegacy修正成功で完了にしない。
4. 行ID重複・欠落とリンク先を確認する。実際に新しい機能差を追加した場合だけ行数を変更し、関連文書の件数も同時更新する。header境界の追記だけならB25の既存scopeで扱う。
5. D / V / R等に変更不要な行も`reviewed-no-change`と根拠を記録する。全test成功を全入力同等性の根拠にしない。

完了: 全行の監査記録があり、比較表冒頭のbaseline説明と現在worktree説明が一致する。

確認: DOC。新たな製品実装や広範な外部調査は追加しない。

<a id="rpf-08"></a>

### RPF-08 修正列の最終確認

前提: RPF-01 / 03のfocused結果が成功し、testやproductionへの追加編集が終わっている。失敗を旧225件の成功結果で隠さない。

確認（cwd=Java。各commandの結果を見てから次へ）:

```sh
sh scripts/test-all.sh
MIKUPROJECT_RUN_NODE_PARITY=true mvn -B -Dmiku.project.node.binary=/opt/homebrew/opt/node@20/bin/node -Dtest=MikuprojectNodeParityTest test
```

記録条件:

- `test-all.sh`はimporter→全Java→専用snapshot verifierの全段階を確認する。途中exit1なら最後まで成功したと書かない。
- Maven XML reportは後続runで上書きされる。commandごとのconsole logと集計を対象RPFのworkplaceへ保存してから次runへ進む。
- default opt-in skipはskipとして記録する。parity commandでは実行されたcase数とskipを記録し、skip-onlyを成功にしない。
- test追加で総件数が変わるので、22/225等の過去の数字は期待件数に使わない。parityの既存caseを削除して成功にしない。
- この計画でNode productionは変更しないためN-FULLは要求しない。予期せずproduction変更が必要になったら該当カードのscopeを先に見直す。

完了: 新しいテストと既存全体確認が同じ最終sourceで成功し、未確認・失敗・skipが明記されている。同じsourceで成功したsuiteを理由なく反復しない。

<a id="rpf-09"></a>

### RPF-09 追跡・報告・最終review

変更先: 比較表、判断記録、採択資料、共有確認結果、Node TODO / migration-worklog、Java TODO、既存plan README / task-index / remaining-work / closeout、END-01/02/03結果。本書の状態表も実際の結果へ更新する。

手順:

1. RV-1〜4を根拠・変更path・確認結果へ対応づけ、満たした指摘だけ解消と記す。資料完成と仕様採択を区別する。
2. REM-03 / 06 / 09 / 10 / 12 / 18を結果に応じて再判定する。REM-07/08の正常経路と今回境界確認をつなぐ。REM-05と仕様/Gate待ちは元のまま具体的に残す。
3. END-02結果へ最新J-ALL / parityとsource状態を追記し、以前のfailureは履歴と明示する。古いhelper停止や次回開始条件が現在指示として残っていないかも確認する。
4. task-indexにある元75行の状態を集計する。`完了（注記）`も完了へ数え、未着手・判断待ち等と合わせて75になることを確認する。RPF10件・REM18件を加算しない。実際の状態を全追跡文書へ反映する。
5. #137 comment草案を直す場合は、固定`writing.issue.prepare`で現行本文/commentsを読む。既存draftを上書きせず、JST timestampを使った新しい`workplace/miku-scm/issue-comments/issue-137-comment-<YYYYMMDDHHMM>.md`へ保存する。GitHubへ投稿しない。取得不能時はローカル修正を終え、草案再作成だけ具体的な不足として残す。
6. Java F-J5草案も今回の確認範囲・件数・未解決header方針に必要な変更がある場合だけ新版を保存する。F-X1 / REF-03 / F-J4の無関係な草案を作り直さない。
7. 両repoで`git diff --check`、`git status -sb`、変更したdiffを確認する。Nodeの新規文書は未追跡でも内容・参照先・余分な空白を確認する。既存version・snapshot・vendorに今回の追加変更がないことを照合する。

手順5の固定evidence取得（cwd=Node。実行時に現行miku-scmの指示も確認する）:

```sh
node /Users/igapyon/.codex/skills/igapyon-miku-scm/scripts/miku-scm-run.mjs --format json writing.issue.prepare --repo /Users/igapyon/Documents/git/miku-project --github-repo igapyon/miku-project --issue 137
```

runnerが示すevidenceを確認してから一度draftし、comment用の保存先を使う。miku-scm自身を変更しないため、SCMのfast/full suiteは今回の修正列では再実行しない。

完了: 4指摘それぞれの解消根拠、最新成功/失敗/skip、残る仕様判断、変更ファイル、最新版draft pathを、人が一つの確認結果文書から辿れる。未実施作業や人の判断を完了と書かない。

## Lunaへ渡す実行指示

後日実行する際は、次をそのまま開始指示に使える。

> `docs/node-java-work-plan-v20261022/self-review-fix-plan.md`を読み、LunaがRPF-00からRPF-09まで依存順に実行する。各カードの完了条件と確認結果を記録する。既存dirty変更を保持し、未決定の仕様/Gateを採択しない。追加の実装不足が見つかった場合は個別の根拠と後続案として残す。commit / push / GitHub投稿は行わず、最終diffと結果を引き渡す。

**実行状態**: ユーザーの明示許可によりRPF-00〜09を完了した。追跡文書、END-01/02/03、ローカル草案、最終diff/statusを整合した。現在のRPF-08実測値は共有確認結果に記録済み。仕様・Gate判断は未採択のまま保持した。
