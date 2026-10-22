# 上限100とJava update_taskの実装計画 — Luna用（2026-10-23）

状態: **2026-10-23にI137-00〜06、08〜11を実施。I137-07はJava進捗率2 fieldの型判断待ちで保留。** depth 0〜100はNode CLI・Java CLI・MCP schemaで完了。Java F-J6は9 fieldを実装し、一部日付入力差も残るため部分対応。実行結果は末尾の「実施結果」に記録する。

対象は、CLI/MCPのdepth上限100と、JavaのF-J6 `update_task`追加。F-S5、F-S6、ほかのlegacy APPLY、reference更新、v1適合は今回の実装対象に含めない。F-S6の日時部分は[Issue #138](https://github.com/igapyon/miku-project/issues/138)、null / empty cellも利用者指示により当面保留する。patch入力の既存clear規則はF-S6のblank-cell変換とは別である。

## 1. 実行前に固定する範囲

| 項目 | 今回の方針 |
| --- | --- |
| CLI `--max-depth` | 指定値は10進数字列の整数0〜100（両端を含む）。100は受理上限であり既定値ではない |
| 省略時 | 現行どおり、選択root以下をdepth制限なしで取得。既定値100を補わない |
| depthの意味 | 選択rootが0、子が1、孫が2。task総数やmodel全体の入れ子を制限しない |
| scope | `scoped`かつroot指定時に取得範囲を制限。`full`やrootなしの既存scope動作を保つ。ただし指定された不正な引数はmodeにかかわらずCLI/MCPで拒否 |
| MCP `maxDepth` | 整数0〜100。Zodと公開JSON Schemaの両方に上限を設定 |
| 直接のcore API `maxDepth` | 今回は変更しない。CLIオプション/MCP入力の境界として上限を実装する。直接APIへの同じ制限導入は別scope |
| Java `update_task` | Nodeの既存dispatch順・field処理順・warning/changesを参照して追加。既存Java utility/codecの変換を一括変更しない |
| 進捗率2field | **型の判断待ち**。下記I137-07で扱う。Lunaが切り捨て・四捨五入・model型拡張を選ばない |
| 日付field | 既存Java task-patch utilityを利用する。workbook importerと汎用date parserの変更は含めない。Nodeと異なる入力受理範囲を記録し、全面適合と報告しない |

計画の実行指示を受けても、まだ選ばれていない進捗率方針や既存Gateを採択済みと扱わない。depth100の希望は本計画の前提とする。

## 2. checkout、参照source、既存変更

| 記号 | repository root | 調査時HEAD |
| --- | --- | --- |
| N | `/Users/igapyon/Documents/git/miku-project` | `9a9f562c03d28f1b0f3c809226dc61d0cd9d5f7e` |
| J | `/Users/igapyon/Documents/git/miku-project-java` | `c0b44214c8bc5ccd8722fd47f7ae98562b6e1643` |
| M | `/Users/igapyon/Documents/git/mikuproject-mcp` | `1cf51ecde5a028aa94ffca69fb6ef8502f3b94bd` |

Node upstreamは`https://github.com/igapyon/miku-project`。この作業は既存Java companionの部分追随であり、新規変換ではない。

NにはREADME、TODO/worklog、version、CLI presentation/testと未追跡の#137資料がある。JにはTODO、remaining-migration-items、ProjectXlsxTestの変更がある。MにはREADME、package/lock、HTTP/server/testの変更がある。実行時に実際のstatusを保存し、これらを保持する。J/Mは現在のworkspaceのwrite許可外なので、実行時に正規のwrite権限を得る。計画作成中にその許可は要求しない。

主要sourceのSHA-256（計画時点）。異なる場合は変更内容を読んで該当カードだけ再評価する。

| root / file | SHA-256 |
| --- | --- |
| N `scripts/lib/cli-command-utils.mjs` | `ffaa5d45741252684ca4d43f7d2d2b7d0f734407aabb85b811313f1c00344253` |
| N `src/ts/project-patch-json-core.ts` | `05066c8f6111fda63cf3435693e7b37d72658853075129ca623d7da1f84f66f7` |
| N `src/ts/project-patch-json-updates.ts` | `6f9525e39917d2eec20735bccfc201a6d18aeecf8d615fac6892e80b6a846252` |
| N `src/ts/project-patch-json-util.ts` | `5d2e3fac98dc698d00468dffc5ae812a2f008d0a8e00b9337fae46914b124a6e` |
| J `src/main/java/jp/igapyon/mikuproject/projectpatchjson/ProjectPatchJsonCore.java` | `883827d813589d53d878c3c1c4c1584a8d69bb21dcc090a1ca91f96a1c1b9363` |
| J `src/main/java/jp/igapyon/mikuproject/projectpatchjson/ProjectPatchJsonUpdates.java` | `d0fe9e4b119f3b3fc36c107876890dcfb25dcfcba1d1bb7f7b0a319ace817bc1` |
| J `src/main/java/jp/igapyon/mikuproject/model/TaskModel.java` | `87d9714e704c077adaff4f3451cfcc9175486788a46a55b70dddb6ffd6c825cd` |
| M `packages/node/src/tools/registerTools.ts` | `58d9612705d3ca6d275208884cca3d58cf3d7832353be6f837203bb3ccf2f62e` |

## 3. 実行順と完了単位

| ID | 内容 | 依存 | 完了条件 |
| --- | --- | --- | --- |
| I137-00 | baseline・書込範囲・source固定 | 実行指示 | source/変更/実行環境を記録 |
| I137-01 | 受入fixture・期待値を固定 | 00 | depth/patchのcase一覧と比較対象が実在 |
| I137-02 | Node CLI depth上限 | 01 | 境界値とusage errorの回帰成功 |
| I137-03 | Java CLI depth上限 | 01 | overflow回避、既存差異test更新、回帰成功 |
| I137-04 | MCP schema上限 | 01 | JSON Schema/Zod両経路が101をruntime起動前に拒否 |
| I137-05 | Java dispatchとtask text fields | 01 | UID/fields/name/notes/calendarの回帰成功 |
| I137-06 | boolean・duration・milestone | 05 | field順とmilestone連動の回帰成功 |
| I137-07 | 進捗率の型方針と実装 | 人の方針選択、05 | 選択scopeの回帰成功、未選択なら判断待ち |
| I137-08 | task date setter | 05、06 | 共通入力と既存parser差の結果を明示 |
| I137-09 | public CLIと現行Node比較 | 02〜06、08（07は採択された場合のみ） | core/CLI/validationの値と副作用を確認 |
| I137-10 | 変更repoの統合確認 | 実施した各カード | 必要suiteが成功、skip/未実施を区別 |
| I137-11 | 判断・残件・比較表を更新 | 09、10 | 完了/部分対応/保留がdocsと一致 |

depth列とtask列は独立。進捗率判断がなくても00〜06、08以降の該当確認は進められる。実装はカードごとに順次進め、完成したカードの確認後に次へ進む。

## I137-00 — baselineを固定する

1. N/J/Mそれぞれでbranch、HEAD、`git status --short`、関連diffを保存する。`-done` branchなら製品変更を始めず、通常の作業branchを用意する。
2. NのNode binary/version、JのJava/Maven、MのNode/TypeScript/dependency導入状態を読む。過去の成功件数は新しい実行結果に転記しない。記録済みの比較環境Node 20.20.2を利用できれば使い、利用できなければ実際のversionで記録する。
3. 上記主要sourceのdigestと現行実装を確認する。Java/MCPの権限不足時はそのrepoの変更を止め、Nや計画資料の独立作業を続ける。権限迂回のために別checkoutの成果を本番repoへ上書きしない。
4. 実行証拠は各repoの`workplace/node-java-137-implementation-v20261023/<card-id>/`へ保存する。

結果形式は[共通手順](README.md#成果の記録形式)を使用し、追加で`compared_node_cli`と`source_digests`を残す。

## I137-01 — fixtureと期待値を先に定義する

Jの新規test fixtureは`src/test/resources/node-java-137-implementation/`、新規focused classは`src/test/java/jp/igapyon/mikuproject/projectpatchjson/ProjectPatchJsonUpdateTaskTest.java`に置く。必要fixtureをignored workplaceだけに置かない。

### Depth fixture

phase P（outlineLevel=1）、root R（level=2）、その子孫C001〜C101（相対depth=1〜101）の鎖、rootと同levelのS（兄弟）を順に並べる。root/task UIDとoutline順で対象を確認し、task件数だけのtestにしない。Nの既存CLI regressionでは既存model生成helperを拡張し、同じ階層構造を作る。巨大な本番データは使わない。

| 入力 | expected |
| --- | --- |
| 省略 | RとC001〜C101。Sは対象外 |
| `0` | Rのみ |
| `1` / `2` | RとC001 / RとC001,C002 |
| `99` / `100` | RとC001〜C099 / RとC001〜C100 |
| `000` / `00100` / 200個の0の後に`100` | 0 / 100 / 100として受理 |
| `101`, `2147483647`, `2147483648`, `9007199254740991`, `9007199254740992` | exit 2、`invalid_integer_option`、option=`--max-depth` |
| 200桁/400桁の9 | 同じusage error。overflow/非finiteのprocessing errorにしない |
| `-1`, `1.5`, `1e2`, `+1`, ` 1 `, `abc` | 同じusage error |
| `full` + 有効100、rootなし + 有効100 | 各modeの従来の取得集合と同じ。depth省略時に100を補わない |
| `full` / rootなし + 不正101 | CLI/MCP入力として拒否 |

成功caseはexit0、named output時stdout空、JSON artifactの対象UID集合とscopeを確認する。不正caseはstdout空、stderrのerror JSONが1個、新規outputは作成されず、既存output sentinelはbyte不変、state inputのSHA-256不変を確認する。

### Task fixtureとcontrol

通常T1、sentinel T2、summary S1、milestone M1、calendar CAL1/CAL2を用意する。T1のname/notes/calendar/critical/percent/duration/dateをすべて明示し、T2には異なるsentinelを入れる。通常の日付は明示datetime、projectのdefaultStartTime=`08:30:00`、defaultFinishTime=`17:15:00`とする。

各caseはfreshなmodelとpatchを使う。base modelと入力patchを前後で比較する。Javaの`cloneProjectModel`は既存のXML export/importを使うため、結果の無関係fieldは**同じ入力に空operationsを適用したcontrol結果**とも比較する。元modelの不変確認と、cloneによる既存変換の検出を別assertionにする。clone/importerを直してtestを合わせない。

Node oracleはNの現行`src/ts/project-patch-json-core.ts` / `project-patch-json-updates.ts` / `project-patch-json-util.ts`。Jのvendored Nodeは新仕様の比較元に使わない。期待値は下記表とsourceの両方で確認し、Nodeの実出力を無審査でgolden化しない。

## I137-02 — Node CLIで0〜100を検証する

変更先: N `scripts/lib/cli-command-utils.mjs`、`scripts/lib/cli-ai-commands.mjs`、`tests/mikuproject-cli-review-regressions.test.js`、README/CLI関連docs。

1. 既存`parseOptionalNonNegativeInteger`の他のcallerを再検索する。CLI `phase-detail`専用のbounded parserを追加するか、当該callerだけで上限確認する。Web/main-utilの別parserを変更しない。
2. 未指定はundefined。数字列regexに合う値のみNumber化し、finiteかつ整数0〜100のみ返す。巨大値/Infinityもusage errorにする。単純な`parseInt`による`1.5`/`1e2`の受理をしない。
3. error codeは`invalid_integer_option`、optionは`--max-depth`を保つ。メッセージに0〜100を明記する。ほかのdiagnostics shapeを一括変更しない。
4. I137-01の全depth caseを既存CLI regressionへ追加する。100で101段目を除き、省略で含むことをassertする。
5. help/READMEに上限と省略時の意味を記載する。既存のNode/Java help全体差はG-HELPの対象として維持する。

確認（将来実行、cwd=N）:

```sh
TZ=Asia/Tokyo node ./node_modules/vitest/vitest.mjs run tests/mikuproject-cli-review-regressions.test.js tests/mikuproject-cli.test.js
```

TypeScript coreは今回変更しないので、このカードだけのためのcore手編集/再生成は不要。最終確認はI137-10を使う。

## I137-03 — Java CLIのoverflowをusage errorへ変える

変更先: J `src/main/java/jp/igapyon/mikuproject/cli/MikuprojectCli.java`、`src/test/java/jp/igapyon/mikuproject/cli/MikuprojectCliRegressionTest.java`、CLI docs。

1. `parseOptionalNonNegativeInteger`のcallerがmax-depthだけか再確認する。未指定nullは維持する。
2. `[0-9]+`確認後、leading zeroを除いた数字列を作る（全部0は`0`）。3桁超または3桁で`100`より大きければstructured usage errorを返す。上限検査後にだけ`Integer.valueOf`する。巨大値を先にint変換しない。
3. error code/option/exitはNodeと同じ。既存`structuredUsageError`を使用し、独自のstderr出力を足さない。
4. 既存`acceptsMissingZeroAndPositiveMaxDepthValues`とinvalid lexeme testを境界caseへ拡張する。
5. 既存`recordsTheJavaIntegerRangeDifferenceForVeryLongMaxDepth`は、旧Node受理/Java processing errorを期待している。**Javaの巨大値usage errorを確認する通常testへ置き換える。** vendored Nodeを更新して通す方法は禁止。現行Nodeとの比較はI137-09に移す。
6. Node/Javaの範囲を揃えたことと、public core APIは変更しないことをCLI docsに明記する。

確認（将来実行、cwd=J）:

```sh
mvn -B -Dtest=MikuprojectCliRegressionTest,MikuprojectCliTest test
```

## I137-04 — MCPの二つの入力schemaを揃える

変更先（cwd=M）:

- `packages/node/src/tools/registerTools.ts`: `maxDepth: z.number().int().min(0).max(100).optional()`。
- `contract/tools/mikuproject_ai_export_phase_detail.input.schema.json`: minimum0を維持しmaximum100を追加。descriptionへroot相対depthと省略時を記載。
- `packages/node/src/test/toolSchemaValidation.test.ts`と`serverSmoke.test.ts`の既存phase-detail case、README/contract mapping。

1. JSON Schemaで省略/0/100をaccept、101/-1/1.5/文字列をrejectする。
2. 実際のMCP tool呼出しでも0/100がruntimeへ渡り、101はZod段階で拒否されることを確認する。既存fake runtimeに呼出しmarkerを持たせ、reject caseで起動されていないこととoutput不在を確認する。
3. `runtimeOperation.test.ts`の引数転送caseは100も確認する。直接内部関数に別の汎用validationを複製しない。
4. transport、error schema、既存HTTP変更、runtime pin、同梱runtimeの更新はこのカードに混ぜない。有効0〜100は既存runtimeにも渡せる。

確認（将来実行、cwd=M、build後にcompiled testを指定）:

```sh
npm run build
node --test --test-concurrency=1 packages/node/dist/test/toolSchemaValidation.test.js packages/node/dist/test/runtimeOperation.test.js packages/node/dist/test/serverSmoke.test.js
```

## I137-05 — Java update_task dispatch、name、notes、calendar

変更先: J `projectpatchjson/ProjectPatchJsonCore.java`、`ProjectPatchJsonUpdates.java`、新規`ProjectPatchJsonUpdateTaskTest.java`。以下のJava pathはすべて`src/main/java/jp/igapyon/mikuproject/`を基準とする。

1. Node coreのupdate_task分岐と同位置関係でdispatchを追加する。operation時点の`taskByUid`を使い、add/move/deleteの後の更新も解決できるようにする。
2. UIDなし→warning、未知UID→tasks scope warning、fields非object/null/list→warning、fields空Map→warningという順序を移す。無効な一operationで次の有効operationを止めない。
3. `applyUpdateTaskOperation(TaskModel, Map<String,Object>, ProjectModel, List<ImportChange>, List<PatchWarning>, int)`を追加する。raw fieldsは`LinkedHashMap`へcopyし、入力Mapを変更しない。型判定は`instanceof String/Boolean/Number`で行い、既存のcoercive stringValue/number/boolをそのまま流用しない。
4. Nodeのfield処理順を保つ。is_milestone→name→notes→calendar_uid→percent2項目（採択時のみ）→critical→planned_start→planned_finish→duration→hours→milestone整合→unknown field warnings。
5. warningsはNode sourceの日本語messageとscope/uid/labelを移す。unknown fieldは`operations[index].fields.<key>`を含める。処理しないfieldを黙って捨てない。

| case | expected |
| --- | --- |
| name=`"  Revised  "` | `Revised`、change field=`name`、T2保持 |
| name空/空白/null/number | warning、name維持 |
| notes=`"  memo  "` | 空白を含めそのまま保存、change field=`notes` |
| notes=`""` | 既存notesをclear。Java内はnull、change.afterは空文字 |
| notes省略/null/non-string | 省略は維持、供給したnull/non-stringはwarning・維持 |
| calendar_uid=`" CAL2 "` | CAL2へ変更、change field=`calendarUID` |
| calendar_uid空/空白 | clearしJava内null、change.after=`(cleared)` |
| 未知calendar/null/non-string | warning・維持 |
| 同値のname/notes/calendar、通常task | changeなし、不要warningなし |
| unknown fieldと有効nameの同時指定 | name更新＋unknown warning |

F-S5のprojection exporterやF-S6のworkbook blank-cell importerは変更しない。新しく実装するpatch setterのempty-clearとnull-type-warningだけを上記規則にする。

## I137-06 — boolean、duration、milestone連動

同じtask update methodとfocused classを拡張する。Booleanに文字列`"true"`や数値1を変換して渡さない。

| case | expected |
| --- | --- |
| critical=true/false | Boolean値を保存、change field=`critical` |
| critical=null/文字列/number | warning・維持 |
| 通常task is_milestone=true | milestone=true。finishをstartへ、durationを`PT0H0M0S`へ。必要な変更だけchanges/warningsを追加 |
| summary is_milestone=true | warning・milestone維持。他の有効fieldsは処理 |
| is_milestone=false | falseへ変更。以前の期間やfinishを推測で復元しない |
| is_milestone invalid type | warning・flag維持。既存milestoneなら下記整合処理は適用 |
| planned_duration=`" PT2H0M0S "` | trimして保存 |
| planned_duration=`" custom "` | Nodeと同じく非空文字列として保存。新たなISO duration検証を足さない |
| duration空/null/number | warning・維持 |
| hours=0/1.5 | `PT0H0M0S` / `PT1H30M0S`。既存`formatDurationHours`を利用 |
| hours負/null/文字列/NaN/Infinity | warning・維持。NaN/InfinityはJava直接APIのcaseで検査 |
| durationとhours同時指定 | 最初にwarningし、durationが優先。duration自体が不正でもhoursをfallback採用しない。入力Mapは不変 |

**milestoneの注意**: Nodeは、空fieldsでreturnする場合を除き、既存milestoneのnameだけを更新してもfinish=start、duration=0を検査する。日付fieldsが省略されたからといってこの既存patch規則を落とさない。既存M1の不整合状態、有効なM1、summary拒否、同時date/duration指定を別caseにし、warning/changesの順序と件数まで確認する。既存workbook importerの時刻補完は変更しない。

## I137-07 — percent2項目の判断と対応

**確認済みの不足**: Nodeはfinite numberの0〜100を受理し、小数も保存する。Java `TaskModel.percentComplete` / `percentWorkComplete`はIntegerで、XML codec/validatorも整数を前提にする。setterで`intValue()`を呼ぶだけではNodeの値を保存できない。

| 選択 | 実行内容 | 完了の表記 |
| --- | --- | --- |
| PCT-A: 今回は2fieldを保留 | percent2fieldはunknown-field warningとして扱う。ほか9fieldを実装し、Nodeとの差を残す | **F-J6部分対応**。percent対応待ち |
| PCT-B: Java整数のみ対応 | 人がruntime差を採択した場合だけ実施。Number/finite/0〜100/小数部0を検査し、受理後だけInteger化。小数はwarning・値維持。`"25"`/null/Booleanもwarning。無言の丸め禁止 | 整数profile対応。Node小数との差を明記 |
| PCT-C: Javaモデルも小数化 | public field型、XML/workbook codec、validator、clone、report、直接API利用者の影響を調べる専用の型移行計画へ分ける | 本計画の範囲ではこの2fieldは判断待ち |

現時点で**選択未確定**。PCT-A/BをLunaが自動採択しない。未回答ならこのカードだけ判断待ちとしてほかを進め、F-J6全完了とは報告しない。

PCT-B採択時の受入caseは両fieldそれぞれ0/25/100/25.0を更新、-1/101/25.5/null/`"25"`/true/NaN/Infinityをwarning・維持。同値ならchangeなし。change fieldは`percentComplete` / `percentWorkComplete`。小数拒否のmessageは既存の範囲外messageと分けて「整数が必要」を明示し、採択記録と期待値を揃える。

## I137-08 — supplied task datesだけを既存utilityへ接続する

1. `ProjectPatchJsonUtil.normalizePatchedTaskDate`を呼ぶ。is_milestoneの処理後のflagを渡す。ProjectWorkbookJsonImport、XML clone、汎用date parserを変更しない。
2. planned_start/finishはそれぞれ不正ならwarning・当該field維持。有効な他fieldの処理は続ける。change field名は`planned_start` / `planned_finish`。
3. date-onlyの通常taskとsummary taskは既存helperの08:30/17:15補完、milestoneはdate-only保持を直接APIで確認する。milestoneでは最後にfinish=startとなる。Project default time未設定のcaseは09:00/18:00。
4. explicit `T` datetimeはtrim以外を変えず保存。省略はsetterから変更しない。null/number/空文字/`bad-date`はwarning・維持。
5. **既存parser差を隠さない**: Nodeはexplicit space datetimeをDateで受理するが、Java helperのLocalDateTime.parseはspaceを受理しない。timezone付き文字列等にも受理範囲差がある。space caseはNode成功/Java warningをそれぞれassertし、F-J6の日付入力の残件として記録する。F-S6保留を理由に汎用parserを改造したり、両方成功とするtestへ書き換えたりしない。
6. date-onlyの検証は両既存helperとも字句パターンを先に見る。暦上の日付妥当性をこのカードで新規に厳密化しない。

ここでの日時fieldは**既存Java helperが扱える入力profileの実装**。space/timezone等の差が残ればF-J6を全面適合とは記さない。Issue #138のscopeをremoteで広げない。

I137-05〜08のfocused確認（将来実行、cwd=J、各まとまりを変更した後）:

```sh
mvn -B -Dtest=ProjectPatchJsonUpdateTaskTest,ProjectPatchJsonTest,ProjectPatchJsonTasksTest test
```

## I137-09 — public経路と現在のNodeを比較する

変更先: J `MikuprojectCliRegressionTest.java`と、新規`src/test/java/jp/igapyon/mikuproject/cli/NodeJava137ImplementationParityTest.java`。

1. Java public CLIで`state apply-patch --state STATE --in PATCH --out NEXT --diagnostics json`を実行し、実際のworkbook cellをUID/headerで照合する。name変更、notes clear、calendar変更、duration、milestoneを別caseにする。
2. `ai validate-patch --state STATE --in PATCH --out REPORT --diagnostics json`でも同じoperationがunsupported-opにならず、予定changes/warningsをreportすることと、STATE/PATCHがbyte不変であることを確認する。validateとapplyのsource inputを混同しない。
3. 未知UID、不正fields、無効field、unknown opの経路を分ける。unknown opは引き続きgeneric warningで継続し、update_taskが実装されたからといって全operationを成功扱いしない。
4. 新規parity classは`-Dmiku.project.current.node.cli=<N>/scripts/miku-project-cli.mjs`と`-Dmiku.project.node.binary=<絶対path>`を**両方明示**したときだけ現行Nをspawnする。Node source pathとdigestをログに残す。既存`NodeJavaLegacyCases.runNode`がvendorを参照することを隠して使わない。
5. 指定がなければ新規opt-in classは明示skipでよい。ただし最終実行ではpropertyを渡し、実行件数が0/全skipなら未達とする。指定されたファイルが存在しない場合はskipでごまかさずfailする。
6. depthの0/100/101/巨大値と、patchのname/notes/calendar/Boolean/duration/共通date inputを比較する。field値、warning、changes、input不変、output有無、exitを比較し、JSON key順や24/24.0等をbyte parityの失敗にしない。
7. 比較するpathをcaseごとに列挙する。F-S6のdate/blank差を消すためにJSON全体のnull→空文字、日時の一括置換、wildcard除外をしない。F-S6差はempty-patch controlと特定fieldのexpected-differenceとして別assertionにする。
8. name変更後のwarning label、unknown fieldの入力順、後続operationから同じUIDを解決すること、base modelとraw fieldsの非破壊も確認する。

確認（将来実行、cwd=J。NODE_BINARYはI137-00の絶対path）:

```sh
mvn -B -Dtest=ProjectPatchJsonUpdateTaskTest,MikuprojectCliRegressionTest test
mvn -B -Dmiku.project.node.binary="$NODE_BINARY" -Dmiku.project.current.node.cli=/Users/igapyon/Documents/git/miku-project/scripts/miku-project-cli.mjs -Dtest=NodeJava137ImplementationParityTest test
```

## I137-10 — 統合確認を一度行う

各変更repoのfocused確認後に、下記を一度実施する。新しい変更・失敗がない限り同じfull suiteを繰り返さない。

| cwd | command | 判断 |
| --- | --- | --- |
| N | `npm run build:full` | CLI変更がbundle/既存suiteに反映される。生成物はscriptに任せる |
| J | `sh scripts/test-all.sh` | importer tests→Maven全体→専用snapshot verifierまで確認 |
| J | `MIKUPROJECT_RUN_NODE_PARITY=true mvn -B -Dmiku.project.node.binary="$NODE_BINARY" -Dtest=MikuprojectNodeParityTest test` | 従来vendorとのlegacy回帰。新upper-boundの現行比較はI137-09とは別 |
| M | `npm run build`、成功後に`npm test` | schema変更と既存server一式。HTTP環境不足/既存失敗を今回の成功に混ぜない |
| N/J/M | `git diff --check`、statusと関連diff | unrelated changesとgenerated/vendorの意図しない変更がない |

Jの229件や旧parity9件は履歴である。追加後の実件数・failure/error/skipを保存し、opt-in skipをpassへ加算しない。依存不足なら既存Setupを使う。version更新、依存更新、release、vendor runtime/snapshot/lock更新をテストを通すための解決策にしない。

## I137-11 — 実施範囲を記録する

1. Nの`node-java-137-decisions.md`、採択パケット、比較表B10/B26とF-J2/F-J6、`remaining-work.md`を更新する。depthの旧int最大値案は上限100の実施内容と区別して履歴化する。
2. JのTODO/remaining-migration-items/upstream mapping等の既存追跡先と、MのREADME/contract mappingを実施範囲に合わせる。
3. F-S5未決定、F-S6全体の現在の保留、#138日時scope、進捗率と日付parserの残件を保持する。coreにhelperがあるだけで対応済みと数えない。
4. depthの三入口（N CLI/J CLI/MCP）を別々に完了判定する。F-J6はdispatch/9field/percent方針/date profileを別欄で記録し、部分対応を全完了と書かない。
5. 元75カード、REM18、R2F8の履歴件数に今回の追加カードを混ぜない。参照資料から本計画へリンクし、実行結果を対応するI137-IDで記録する。

## 4. 実行前に用意した指示（履歴）

```text
docs/node-java-work-plan-v20261022/README.md と
docs/node-java-work-plan-v20261022/implementation-plan-v20261023.md を読む。
I137-00〜11のうち開始条件を満たすカードを実行する。
depthはCLI/MCPで0〜100、未指定は現状維持。
Java update_taskはNodeの既存入力規則を参照し、field順と副作用を確認する。
進捗率方針が未回答ならI137-07を判断待ちとし、独立カードを続ける。
F-S5/F-S6や既存Gateを採択・実装しない。vendor/snapshotを更新しない。
実際のsource、確認結果、部分対応、残件をI137-IDごとに報告する。
```

この指示は実施前の引渡し文面である。実施後の状態は次節に記録する。

## 5. 実施結果（2026-10-23）

| カード | 結果 |
| --- | --- |
| I137-00〜01 | N/J/Mのbaselineと既存dirty変更を保持。depth境界、101段の階層、patch operationの受入fixtureとpublic比較を用意 |
| I137-02 | Node CLI `--max-depth`を整数0〜100へ制限。未指定は従来どおり無制限。96 CLI regressionとNode full build/testが成功 |
| I137-03 | Java CLIを0〜100へ制限し、巨大値・不正字句をusage errorに統一。境界回帰を追加 |
| I137-04 | MCP Zodと公開JSON Schemaに0〜100を設定。package-local生成contractも追随し、schema/runtime境界3件を確認 |
| I137-05〜06 | Java `update_task` dispatchと9 fieldを実装: `name`, `notes`, `calendar_uid`, `critical`, `is_milestone`, `planned_start`, `planned_finish`, `planned_duration`, `planned_duration_hours` |
| I137-07 | 当初は進捗率2 fieldの型判断待ちとして保留。2026-10-23 follow-upでMS Project XMLのinteger型に合わせ、Node/Java双方で0〜100の整数を適用し、小数・範囲外・数値以外はwarning-and-preserveとした |
| I137-08〜09 | Java既存task-date helperを利用。現行Node CLIとの比較で共通日付、space/T表記差、Javaがspace datetimeを受理しない差を回帰固定。Issue #138とF-S6の方針は変更していない |
| I137-10 | N `npm run build:full`: 32 files / 374 tests passed。J `sh scripts/test-all.sh`: importer 12/12、Maven 238 tests（0 failures / 0 errors / 14 skipped）、snapshot verifier 8/8。Java focused / current Node parity: 41/41、skipなし。MCP focused 3/3。MCP full buildは既存dirty `createServer.ts`の`ServerOptions.maxToolInputElements`型エラーで停止 |
| I137-11 | N/J/Mのtrackingを更新。既存dirty changesを保持し、commit/pushは行っていない |

実装先はN/J/Mの実repoへ適用した。Java/MCPの確認は、既存の未コミット変更を含めて作成した一時copyで実行した。Node/J/Mの`git diff --check`は成功。MCP buildの既存型エラーと14件のJava opt-in skipは成功件数へ加算していない。

2026-10-23 progress-field follow-up: Node TypeScriptと生成JavaScriptを更新し、`npm run build:core`で生成物を更新した。Java source、既存focused testの期待値、tracking docsも更新した。follow-up後のテストは実行していない。

### 現在の残件

- F-J6は部分対応。`percent_complete` / `percent_work_complete`はMS Project XMLのinteger型に合わせてNode/Java双方で整数0〜100を受け付け、小数・範囲外は警告して既存値を維持する。Javaのspace-separated datetime parser差が残る。
- `planned_start` / `planned_finish`のJava setterは既存helperを使用する。space-separated datetimeはNodeが受理しJavaがwarningにする。日時精度・区切りの共通化はIssue #138へ延期。
- F-S5 projectionの未設定値表現、およびF-S6のnull / empty-cell方針は未決定のまま。
- `--max-depth` 0〜100はCLI/MCP境界。直接Java core APIの型・上限は変更していない。
