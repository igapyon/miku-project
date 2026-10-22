# #137 残作業の実行計画

2026-10-23: [上限100とJava update_taskの実装計画（Luna用）](implementation-plan-v20261023.md)に沿ってI137-00〜11を実施した。depth 0〜100はNode/Java CLIとMCPで完了。Java F-J6は9 fieldを部分実装し、進捗率2 fieldとspace datetime parser差が残る。F-S5、F-S6 null / empty cellは利用者指示により未実施。結果とテスト件数は計画末尾に記録した。

状態: **実行済み範囲の追跡更新済み（2026-10-23）**。元の75カードは37件完了、2件判断待ち、36件未着手。END-03は報告草案と重複確認が完了した。補充カードはREM-01〜04、REM-06〜12、REM-15〜18が完了、REM-05は再現原因未確定のため保留、REM-13〜14は人の仕様採択待ち。I137の追加実装は別計画として追跡し、この補充カードや元の75件へ加算しない。

本書を次回の開始点とし、[共通手順](README.md)、[元の作業索引](task-index.md)、[判断記録](../node-java-137-decisions.md)を併読する。元の36未着手カードは再作成せず、既存APPLY / REF / V1カードをそのまま実行単位として使う。REMは既知テスト失敗、追加発見、調査・採択準備、報告経路の不足を補う。

## 現在の根拠と完了の区切り

| 項目 | 記録済みの状態 | 残作業 |
| --- | --- | --- |
| 自己レビュー6指摘 | 修正済み。Node 20.20.2のopt-in targeted runは34/34成功 | 再実装せず、次の変更のbaselineにする |
| Java全体確認 | Historical END-02 224 tests / 2 PRE-02 failures; historical F-J5 225 tests; RPF-08 passed importer 12/12, Maven 229 tests (0 failures/errors, 11 opt-in skips), dedicated snapshot verifier 8/8. | R2F-06 `sh scripts/test-all.sh` passed after R2F-02 assertions: importer 12/12, Maven 229 tests (0 failures/errors, 11 opt-in skips), verifier 8/8. Node 20 parity 9/9 remains historical |
| snapshot確認 | 全体suiteとscript末尾の専用`ContractSnapshotVerifierTest`が各8/8成功 | 完了 |
| XLSX byte parity | Node 20.20.2は9/9成功。Node 26.12.0の以前の不一致は同じfocused testを2回実行して未再現 | 原因は確定していない。REM-04完了、REM-05は原因確定まで保留。version起因と断定しない |
| B25 / F-J5 | Java XLSX importをheader名mappingに変更し、Java native列は保持 | Implementation is committed at Java HEAD `c0b4421`. Historical F-J5 counts: focused Java 22/22, Node 20 parity 9/9, J-ALL 225. RPF-08: full J-ALL 229 tests and snapshot verifier 8/8, before R2F-02 assertion edits. Current R2F-06 passed importer 12/12, Maven 229 tests, snapshot verifier 8/8; Node 20 parity 9/9 remains historical. |
| B23 / F-S5、B24 / F-S6、depth上限 | consumer根拠と選択肢を追加し[採択判断パケット](../node-java-137-adoption-packet-v20261022.md)へ集約 | F-S5とF-S6 null / empty cellはREM-13/14で判断待ち。日時変換・表記変更はIssue [#138](https://github.com/igapyon/miku-project/issues/138)へ延期。depth上限100はREM-15で採択・実装済み |
| END-03 | #137本文・commentsを固定readerで再取得。コメント0件。後続草案4件と#137報告comment draftを保存 | END-03時点では草案のみ。後続作業として2026-10-23にF-S6日時差のIssue [#138](https://github.com/igapyon/miku-project/issues/138)を作成 |
| v1適合 | REF-01提案済み、REF-02以降とV1-01〜27は未着手 | referenceと既存Gateを順に満たして既存カードを実行する |

失敗名は`MikuprojectCliTest.keepsReadmeCliCommandListInSyncWithHelpOutput`と`rejectsLegacyFlatCommands`。現時点の成功・失敗件数は履歴であり、次の実行結果へそのまま転記しない。

#137の調査引渡しはEND-03の報告草案と後続追跡が揃えば完了判定できる。v1全実装やGate G5までを#137調査完了の前提へ追加しない。GitHub上の更新・Issue作成・閉鎖は、実施した事実と対応するSCM指示がある場合にだけ記録する。

## 推奨する実行順

1. **確認を正常化する**: REM-01→REM-02/03。REM-04でbyte不一致を分類し、既存契約内の修正が必要ならREM-05へ進む。
2. **再現済みのデータ誤配置を直す**: REM-06→REM-07→REM-08。F-J5は既存importのbug修正で、G-HELP・G-XML・v1 reference採択を前提にしない。
3. **採択に必要な資料を揃える**: REM-09/10/11→REM-12。既存提案の採択記録が得られた項目からAPPLY-01〜05とREM-13〜15を一項目ずつ進める。差異維持が採択された場合は根拠・docs・確認で完了できる。
4. **報告を仕上げる**: REM-16→REM-17は上の仕様採択やv1完了と独立に進める。固定readerの失敗が続いても、影響しないローカル修正・調査は継続する。
5. **referenceを更新する**: source identity採択→REF-02→生成manifest/outer-lock digest採択→REF-03→REF-04→REF-05→G-P5-C1の承認。
6. **v1をsliceごとに実装する**: 下表の既存V1カードを順に実行する。各review境界で証拠を保存する。
7. **実施した範囲を統合確認する**: REM-18でEND-01/02と両repoの追跡文書を更新する。大きな作業列の終わりごとにも同じ手順を適用する。

この順序は実行の推奨順であり、無関係な作業間の新しい技術依存ではない。既に記録された承認は対象revision・scopeを確認して再利用する。今回は計画のみを作成し、採択済みという記録や製品変更は行わない。

## 補充カード索引

計画作成時点では全件未着手だった。現在状態は次のとおり。「採択後」は依存条件であり、実行指示や資料完成を仕様採択と解釈しない。

| 補充カード | 現在状態 | 結果 / 次の条件 |
| --- | --- | --- |
| REM-01 | 完了 | Baseline・既存dirty変更を特定し保持 |
| REM-02 / REM-03 | 完了 | Java README/helpと公開拒否診断testを整合 |
| REM-04 | 完了 | Node 26 focused XLSX mismatchを2回再実行、両方成功。原因未確定 |
| REM-05 | 保留 | 再現原因が確定していないため修正対象なし |
| REM-06〜REM-08 | 完了 | F-J5 header mapping実装とJava全体確認まで完了 |
| REM-09〜REM-11 | 完了 | consumer/date/depth evidenceと選択肢を補足、採択は未実施 |
| REM-12 | 完了 | 採択判断パケットを保存 |
| REM-13〜14 | 判断待ち | F-S5とF-S6 null / empty cellの採択待ち。F-S6日時差はIssue #138へ延期 |
| REM-15 | 完了（2026-10-23） | depth上限100を採択し、Node/Java CLIとMCPで実装・回帰確認。core APIは対象外 |
| REM-16 | 完了 | 固定reader修復・配備後に#137本文とcommentsを取得 |
| REM-17 | 完了 | 後続草案を再確認し、#137報告案と重複確認を保存 |
| REM-18 | 完了 | 両repoの追跡文書と実施結果を統合更新 |

| ID | 作業 | 依存・開始条件 | 対応先 |
| --- | --- | --- | --- |
| [REM-01](#rem-01) | 現在source・toolchain・既存証拠を固定する | なし | 両repo |
| [REM-02](#rem-02) | Java READMEのcommand一覧を既存helpへ揃える | REM-01 | Java docs |
| [REM-03](#rem-03) | 旧flat command拒否testを公開診断契約へ揃える | REM-01 | Java tests |
| [REM-04](#rem-04) | WBS XLSX byte不一致の原因を切り分ける | REM-01 | 両版の比較 |
| [REM-05](#rem-05) | 確定したbyte不一致原因だけを修正する | REM-04、原因と対応方針の確定 | 原因を所有するrepo |
| [REM-06](#rem-06) | F-J5のheader別期待値を固定する | REM-01、LEG-J16の証拠 | Java tests |
| [REM-07](#rem-07) | XLSX importの共通列をheader名で対応づける | REM-06 | Java core |
| [REM-08](#rem-08) | F-J5のCLI・native roundtripを確認する | REM-07 | Java tests/docs |
| [REM-09](#rem-09) | F-S5のconsumerと未設定field規則を整理する | REM-01 | 判断資料 |
| [REM-10](#rem-10) | F-S6の日時・空cellの意味を整理する | REM-01 | 判断資料 |
| [REM-11](#rem-11) | max-depthの範囲・精度・overflow方針を提案する | REM-01 | 判断資料 |
| [REM-12](#rem-12) | 既存・追加提案の採択用資料を揃える | REM-09〜11、既存DEC/REF提案 | Node docs |
| [REM-13](#rem-13) | 採択されたF-S5だけを反映する | REM-09、F-S5の採択記録 | 対象runtime/consumer |
| [REM-14](#rem-14) | 採択されたF-S6だけを反映する | REM-10、F-S6の採択記録 | 対象runtime/consumer |
| [REM-15](#rem-15) | 採択されたdepth方針を反映する | REM-11、depthの採択記録 | 対象runtime |
| [REM-16](#rem-16) | #137の固定readerの取得経路を復旧する | REM-01 | SCM所有元 |
| [REM-17](#rem-17) | END-03の報告・後続草案を更新する | REM-16、END-01 | Node/Javaのローカル草案 |
| [REM-18](#rem-18) | 実施範囲の統合確認と記録を更新する | REM-02、REM-03、REM-04、REM-08、実施カードの完了または保留理由 | 両repo |

## すぐ着手できる確認・bug修正

<a id="rem-01"></a>

### REM-01 現在source・toolchain・既存証拠を固定する

- 入力・範囲: 両repoのbranch/HEAD/status/diff、追跡worklog、PRE-02/LEG-J16/END-02の既存記録、各repoのSetup・Release workflow。
- 手順: 既存dirty変更と今回対象を記録する。Nodeの実行file・version、JDK/Maven、timezone/locale、依存lockfile digestを記録し、既存結果がどのsourceで得られたか照合する。外部参照は必要なものだけ読む。
- 完了: 再利用できる証拠と、source変更・不足のため再確認が必要なcaseが判別できる。既存dirty変更を消さず、成功済み確認を理由なく反復しない。
- 確認: DOC。新しい実行baselineを得る必要があると判断した対象だけfocused確認する。

<a id="rem-02"></a>

### REM-02 Java READMEのcommand一覧を既存helpへ揃える

- 入力・変更範囲: Java `README.md`、`MikuprojectCli.printUsage`、`MikuprojectCliTest.keepsReadmeCliCommandListInSyncWithHelpOutput`。
- 手順: 許可済みの`--out`を掲載しているhelpとREADMEの4command（spec / detect-kind / validate-patch / diff）を照合する。READMEに不足する構文を補い、一覧の同期assertionを維持する。実際のgrammar/option位置は変更しないためG-HELP採択を待たない。
- 完了: Java固有commandを含む一覧全体がhelpと一致し、既知failureが解消する。test側で4行を除外して成功にしない。
- 確認: J-FOCUS `MikuprojectCliTest#keepsReadmeCliCommandListInSyncWithHelpOutput`。

<a id="rem-03"></a>

### REM-03 旧flat command拒否testを公開診断契約へ揃える

- 入力・変更範囲: Java `MikuprojectCliTest.rejectsLegacyFlatCommands / assertUnknownCommand`、CLIの`structuredUsageError`と既存公開診断契約。
- 手順: 6個の旧commandを一件ずつ確認する。拒否自体が正しければ、古い英語messageの完全一致を現行の構造化診断（usage / unsupported command）または既存の安定した公開条件へ置き換える。契約違反があればproduction側を直す。
- 完了: exit 2、primary stdoutなし、正しいcommand/code、error一件を検査し、旧commandが受理された場合は必ず失敗する。message言語を合わせる目的の製品変更や拒否assertionの削除はしない。
- 確認: J-FOCUS `MikuprojectCliTest#rejectsLegacyFlatCommands`、続けて`MikuprojectCliTest,MikuprojectCliRegressionTest`。

<a id="rem-04"></a>

### REM-04 WBS XLSX byte不一致の原因を切り分ける

- 入力・範囲: Java `MikuprojectNodeParityTest.comparesStandaloneReportCommandBytesWithNodeWhenEnabled`、`NodeJavaLegacyCases`、両版のWBS XLSX/ZIP生成、同一`dependency.xml`由来workbook。
- 手順: Node 20.20.2成功と26.12.0失敗は観測値として扱う。repoに宣言されたtoolchainを確認し、同一入力・同一lock・同一timezone/localeで各runtimeの同一入力反復とcross-runtime比較を行う。必要な失敗artifactをcleanup前に保存し、ZIP entry名/順序、timestamp、圧縮、CRC、member bytesとOOXML fieldまで差を局所化する。モデル生成時刻や環境差も検査する。
- 完了: 最初に異なるentry/fieldまたはZIP metadata、再現条件、所有source、影響する実行環境が記録される。Node version以外が未統制ならversion原因と断定しない。再現しなければ「未再現」と不足条件を残す。
- 確認: 同じartifactのhash・entry/member比較と当該test。新しいgoldenを現在出力から作らず、単にbyte assertionをsemantic比較へ弱めない。

<a id="rem-05"></a>

### REM-05 確定したbyte不一致原因だけを修正する

- 入力・変更範囲: REM-04の特定pathと再現case。既存byte契約を守る修正なら原因を所有するNode/Java coreまたはtest harnessのみを変更する。
- 手順: timestamp等の非決定値なら既存のdeterministic出力規則へ揃える。意味差なら該当fieldの既存契約へ揃える。対応Node versionの追加/除外が必要な場合は、そのscopeを判断記録へ提示し、採択前にsupport policyを変更しない。
- 完了: 特定した再現caseが成功し、元のartifact内容/ZIP構造を保持する。調査結果が意図した差異なら修正を無理に作らず、根拠と採択された確認範囲を記録する。未確定の原因を「Node 20固定」で解決済みにしない。
- 確認: 当該focused caseとJ-PARITY。Node core変更時だけ対応TypeScriptを編集して生成し、作業列完了時にN-FULLを実施する。

<a id="rem-06"></a>

### REM-06 F-J5のheader別期待値を固定する

- 入力・変更範囲: LEG-J16のB25再現結果、Java `ProjectXlsxImportEntities`、各sheet importer、`ProjectWorkbookSchema`、既存`ProjectXlsxTest`/CoreApi/CLI tests。
- 手順: NodeのTask/Resource/Assignment共有headerとJava native headerを対応表にする。NotesとCalendarUIDへ異なるsentinel値を入れ、Node列順・Java列順・許容される並べ替えで期待するfield値を固定する。Resource/Assignmentにも同種の列ずれがないか確認する。既存fixture・結果を再利用できる場合は再現用の重複器を作らない。
- 完了: 欠落列、未知列、重複headerの既存validation規則が明記され、各sentinelがどのfieldに入るべきか一意になる。Java-only列の保持条件もある。
- 確認: public import APIを使う意味のある回帰。現在の位置依存bugを検出し、正常native workbookの期待値も確認できる。

<a id="rem-07"></a>

### REM-07 XLSX importの共通列をheader名で対応づける

- 入力・変更範囲: REM-06の対応表とJava `projectxlsx/ProjectXlsxImport*`。外部headerの扱いは既存schema/validationに従う。
- 手順: `headers[headerIndex]`と同じ位置のcellを読む現在の対応を、入力headerに対応するcell indexの解決へ変更する。Project sheetの特殊layoutとCalendar等の別形式は既存処理を確認して扱う。根拠のないheader aliasや大文字小文字変換は追加しない。
- 完了: Node共通列が正しいJava fieldへ入り、native拡張列は保持される。既存の欠落/未知/重複header診断を黙って変更しない。診断変更が不可避なら変更理由と影響を記録する。
- 確認: REM-06の回帰とJ-FOCUS `ProjectXlsxTest,CoreApiWorkbookTest`。

<a id="rem-08"></a>

### REM-08 F-J5のCLI・native roundtripを確認する

- 入力・変更範囲: `import xlsx` CLI、既存Node出力fixture、Java native workbook、既存import/export testsと追跡docs。
- 手順: Node XLSX→Java CLI→共通workbook値、Java native XLSX→Java import/exportの拡張値保持を別に確認する。Node実行が必要なcaseは既存opt-in規則を使い、通常Mavenには追跡fixtureまたはJavaだけで完結する回帰を残す。
- 完了: Notes/CalendarUID等の誤配置がなく、native列も落ちない。B25/F-J5、Java TODO、Issue草案の状態が実際の確認結果と一致する。
- 確認: J-FOCUS `ProjectXlsxTest,CoreApiWorkbookTest,MikuprojectCliRegressionTest`。共有CLI経路を変えた作業列の終わりにJ-ALL/J-PARITY。

## 仕様判断の補充と採択後の反映

<a id="rem-09"></a>

### REM-09 F-S5のconsumerと未設定field規則を整理する

- 入力・範囲: B23、AI JSON spec、両版のtask-edit/bundle生成、Skills/MCPの該当consumerとprompt例。
- 手順: `notes`と`calendar_uid`について、省略/null/空文字をread・edit・patch生成でどう解釈するかsource付きで追う。参照できないconsumerは未確認と記録する。数値の`24`/`24.0`表記差と未設定値の意味差を混ぜない。
- 完了: field別の現在値・consumer依存・互換影響、共通化/部分共通化/差異維持の選択肢と推奨案が判断記録にある。採択欄は未決定のまま残す。
- 確認: DOC。必要な再現だけ既存LEG-J14 caseを使う。

<a id="rem-10"></a>

### REM-10 F-S6の日時・空cellの意味を整理する

- 入力・範囲: B24、LEG-J15/J16、legacy workbook/AI JSONの日時仕様、両版model conversionとpatch consumer。
- 手順: date-only、local datetimeのspace/T、null/空文字を別々に追う。09:00/18:00補完が必要な入口・field、保持すべき元の精度、未指定patchと値消去の違いを記録する。v1のlocal civil datetime契約をlegacyへ自動適用しない。
- 完了: summarize/apply-patch/export/importの対象field表とconsumer影響があり、両版のどちらを変える案か、差異維持案かを具体的に選べる。
- 確認: DOC、既存fixtureで必要な値比較。採択前にdate/nullの一括normalizeを行わない。

<a id="rem-11"></a>

### REM-11 max-depthの範囲・精度・overflow方針を提案する

- 入力・範囲: B10、LEG-J08の200桁観測、JavaのInteger API/比較、NodeのNumber変換とconsumer。
- 手順: 上限と精度、上限超過時のusage/processing分類、API互換性を案A（共有int上限）/B（Java拡張）/C（差異維持）で比較する。`2147483647`、その次、safe-integer境界、200桁、非有限化する長さを対象にする。
- 完了: exactな受理上限・丸め禁止/許容・error code・対象APIが採択案に書かれる。CでもJava overflowをどう報告するかを明示し、「巨大値だけ未決定」を放置しない。
- 確認: DOCと不足する境界観測。採択前にNodeの既存受理範囲を狭めない。

<a id="rem-12"></a>

### REM-12 既存・追加提案の採択用資料を揃える

- 入力・変更範囲: 既存判断記録、XML inventory、reference提案、REM-09〜11の資料。
- 手順: 下表の項目ごとに推奨案、変更runtime/command/field、互換影響、受入case、採択後のカードを一ページから参照できるようにする。source/tag採択と生成digest採択を分ける。
- 完了: 選択肢と対象を具体的にreviewできる。決定者・日付・採択内容は実際の回答が得られるまで未決定とし、資料完成をGate承認と数えない。
- 確認: DOC。既に有効な承認があれば再要求せず、記録への参照を追加する。

| 判断項目 | 現在の提案・必要な選択 | 採択後の作業 |
| --- | --- | --- |
| G-HELP | DEC-01推奨A: 現在のgrammarとJava aliasの差異を維持 | APPLY-01。維持なら文書・確認を中心に完了 |
| G-PARENT | DEC-02推奨A: 親directory作成のruntime差を維持 | APPLY-02 |
| G-REPORT | DEC-03推奨A: Javaで過去に効果のあったoption×commandだけ限定復旧 | APPLY-03。mermaid等の無効果組合せを一律許可しない |
| G-META | DEC-04推奨B: Javaは実際の出力先を記録し、Nodeの凍結例外を維持 | APPLY-04 |
| G-XML | default省略5fieldは差異維持案、unknown XMLはlossy subset明文化案、forward PredecessorUIDはJava二段階validator案 | APPLY-05を採択fieldごとに実行。XML全体一括変更にしない |
| G-REFERENCE/source | exact `v1.1.1` / `9a9f562c03d28f1b0f3c809226dc61d0cd9d5f7e`とscopeの採択 | REF-02 |
| G-REFERENCE/digest | REF-02が生成・検証したmanifest/outer-lock digestの採択 | REF-03〜REF-05 |
| F-S5 | REM-09のconsumer調査後にfield別unset規則または差異維持を選ぶ | REM-13 |
| F-S6 | REM-10で日時精度・空cellの各規則を選ぶ | REM-14 |
| depth上限 | REM-11で上限100を採択済み | REM-15完了。CLI/MCP境界に実装 |

<a id="rem-13"></a>

### REM-13 採択されたF-S5だけを反映する

- 入力・変更範囲: 採択された`notes`/`calendar_uid`規則、該当task-edit/bundle exporterとconsumer。
- 手順: fieldごとに未設定・null・空文字・値ありをfixture化し、選ばれたruntimeだけ変更する。差異維持が採択された場合はconsumerの許容形と例外をdocsへ記録する。
- 完了: 編集時の「未指定」と「消去」が誤って入れ替わらず、他のprojection/数値表記は維持される。
- 確認: 該当exporter/API/CLIのfocused確認。変更repoだけN-FULLまたはJ-ALL、共有経路ならJ-PARITY。

<a id="rem-14"></a>

### REM-14 採択されたF-S6だけを反映する

- 入力・変更範囲: F-S6のnull / empty cell規則と、別途Issue #138で将来採択される場合の日時精度・変換規則。対象model conversion、workbook adapter、summary/patch経路。
- 手順: date-only、明示datetime、null/空文字、未指定patchを一つずつ確認して変更する。schedule補完や値消去の意味が変わるなら移行影響も記録する。差異維持ならその範囲を明文化する。
- 完了: 対象外field・入力の意味が保たれ、同じstateのsummary/apply/export/importについて採択値を追える。日時変換の実装はIssue #138で別途判断されるまで開始しない。
- 確認: LEG-J15/J16を基にしたfocused値比較と入力不変確認。変更repoの全体確認、共有経路のJ-PARITY。

<a id="rem-15"></a>

### REM-15 採択されたdepth方針を反映する — 完了 2026-10-23

- 入力・変更範囲: CLI/MCPの上限100。直接core APIの型・範囲変更は今回の対象外とした。
- 実施: omitted/0/100を保持し、101・巨大値・不正字句をusage/schema errorとして拒否。Javaのoverflowもusage errorにした。
- 完了: Node/Java CLIとMCPの有効範囲が0〜100で一致。失敗時にartifactを作らない。Java/Node depth CLI比較とMCP schema/runtime境界を回帰確認。
- 確認: Node full build 374 tests、Java `test-all` 238 tests（0 failures/errors、14 opt-in skips）、MCP focused 3/3。

## Issue報告経路と引渡し

<a id="rem-16"></a>

### REM-16 #137の固定readerの取得経路を復旧する

- 入力・範囲: 現行`igapyon-miku-scm`の固定runner、`github.issue.read` / `writing.issue.prepare`、既存END-03の失敗記録。canonical sourceのcheckoutは`/Users/igapyon/Documents/git/igapyon-agent-skills`で、`skills/igapyon-miku-scm/scripts/github-issue-read.mjs`の存在を確認済み。実行開始時にこのrepoのbranch/statusとinstalled skillとの差を確認する。
- 手順: 実行時に現行skillの仕様を読み、対応する固定read/prepareを一度使ってIssue本文・labels・commentsの取得を確認する。成功すれば旧blockerを解除する。失敗が続く場合は、インストール済み`gh`とのargv互換をcanonical SCM sourceで修正する作業として切り出す。source側で既に直っていれば公式の配備手順で反映する。installed skillを製品repoから直接書き換えない。
- 完了: 取得結果が#137全commentsと本文を含み、repository/Issue identityを確認できる。SCM修正が必要ならそのowner/path、再現、修正・配備・確認を追跡する。認証/権限/network不足は具体的な不足として残す。
- 確認: SCM修正時のみskill指定のfast/full testsと必要なcontract再生成・drift確認を行い、その固定helperで再取得する。直接`gh`を発行して回避しない。無関係なローカル作業は止めない。

<a id="rem-17"></a>

### REM-17 END-03の報告・後続草案を更新する

- 入力・変更範囲: 取得済み#137本文/comments、比較表、判断記録、本計画、保存済み4草案、実施済みカードの結果。
- 手順: 最新の成功/失敗、仕様未決定、差異維持、修正済み、後続作業を報告草案へ反映する。4草案を既存Issueと重複確認し、F-J5等の実施状況で目的が変わった草案は更新する。F-S5/F-S6/depthの追跡漏れを補う。
- 完了: #137報告草案と対応先別草案の実在pathがあり、人が本文をreviewできる。END-03を完了にする根拠は草案の完成で、GitHubへ投稿したという記録は実行事実がある場合のみ。
- 確認: DOC、固定writing evidenceとの対応。草案が古い結果を引用していないことと、#137調査・後続v1実装の完了条件を確認する。

## 既存の36未着手カードの進め方

| 作業列 | 既存カード | 入口と区切り |
| --- | --- | --- |
| legacyの採択反映 | APPLY-01〜05（5件） | それぞれの採択記録が入口。採択field/commandだけを変更し、差異維持ならその確認で完了 |
| reference更新 | REF-02〜05（4件） | source/tag採択→REF-02の候補生成→生成digest採択→REF-03/04のimmutable snapshot追加→REF-05のP5-C1再review資料 |
| 共通処理とinspect | V1-01〜07 | G-P5-C1承認後。既存validateを保ちながら共通部品とinspectを実装し、V1-07で技術review |
| plan-change | V1-08〜10 | inspectとcanonical XML基盤後。純粋変更、output plan、preflight、P5-C3の確認 |
| apply-change | V1-11〜18 | artifact検証、approval/runtime binding、provenance、exclusive publisher、所有物cleanupを順に作り、failure matrixをreview |
| verifyと再入力 | V1-19〜20 | public verify-artifactとcommitted artifact set入力を接続 |
| 全corpus比較 | V1-21 | 採用referenceとJavaを固定し、coverageとsemantic/contract差分を確認。G-P5-D採択資料を作る |
| runtime配布とGate G5 | V1-22〜27 | G-P5-D後にmanifest intake、control、launcher、三member、隔離smokeを実装・検証。V1-27は資料完成までで、G5の人の承認は別に記録 |

旧`v1.0.3` snapshot/G4 lockとlegacy subtreeはそれぞれのauthorityを維持する。新しいsnapshotやruntimeをdirty checkoutから作らず、採択済みexact identityから生成する。v1 fixture/goldenを現在のNode出力で作り直さない。

## 統合確認と実行時の終了条件

<a id="rem-18"></a>

### REM-18 実施範囲の統合確認と記録を更新する

- 入力・範囲: 実施カード一覧、採択/保留記録、各focused確認、最終source diffとbaseline。個別作業列の途中確認ではREM-18の最終完了を先取りしない。
- 手順: 変更した作業列の終わりにJavaはJ-ALL、共有legacyは採用toolchainのJ-PARITY、Node source変更時はN-FULLを行う。同じsourceで成功済みの必要確認は再利用する。既存failure 2件とNode 26不一致のdispositionを記録し、失敗したまま「全体成功」としない。
- 完了: `test-all.sh`がimporter→全Java→専用snapshot再確認まで成功し、実施した共有legacy変更のJ-PARITYが採用toolchainで成功する。defaultの想定内opt-in skipと、それ以外の未実行を区別し、skipをpassへ加算しない。失敗が残る場合はREM-18を完了にせず、未達case/原因/担当作業を記録する。比較表、Node TODO/worklog、Java TODO/remaining-migration-items、元索引・補充索引、END-01/02/03の実際の状態が一致する。
- 確認: DOCと対象別確認。公開リンクは追跡対象docsへ向け、ローカル実行ログは`workplace/`へ置く。diff/statusを確認して引き渡す。

次の実行指示が来た場合は、まずREM-01〜04とREM-06〜12、REM-16〜17の依存を満たす作業を進める。原因確定済みのREM-05とbug修正REM-07/08も続けて実行できる。仕様採択・Gate待ちのカードは未決定値を具体的に示し、独立作業を完了させたうえで採択用資料を提示する。採択待ちを理由に計画全体を最初から停止しない。

今回の計画作成では製品コード・tests・runtime・snapshotを変更せず、製品test/build・GitHub取得/更新も実行していない。参照リンク・カード依存・元の進捗件数・文書差分だけを確認する。
