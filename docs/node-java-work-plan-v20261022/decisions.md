# 仕様判断を準備し、決定後に反映するカード

[共通手順](README.md)に従う。DECは根拠・選択肢・判断案を作る作業。APPLYは対応する決定記録の状態が確定してから扱う。DEC-01とDEC-03は判断待ち、他カードは索引を参照する。

<a id="dec-01"></a>

### DEC-01 legacy helpとoption位置の判断案を作る

- 依存: PRE-01
- 対象: 両版。F-S1、B03。解除対象G-HELP。
- 入力・範囲: Node entry/argv、Java run/inspectInvocation、help tests、README/実行例。
- 手順: root help、command後help、先頭option、unknown command+helpを表にする。実装・利用例・履歴を照合する。案Aは既存差を明文化、案Bは共有command helpを追加、案Cはoption位置まで共通grammar化。各案の既存呼出しへの影響を記録する。
- 完了: `docs/node-java-137-decisions.md`へ、受理するargv例、exit、channel、入力未読条件、変更先を含む提案を記録。推奨案と採用決定は別欄。未決定ならG-HELPを解除しない。
- 確認: DOC。将来の再現時は入力読取で待たない固定stdin/timeoutを使う。

<a id="dec-02"></a>

### DEC-02 output親directory作成の判断案を作る

- 依存: PRE-02
- 対象: 両版。F-S1、B16。解除対象G-PARENT。
- 入力・範囲: Node writeOutput、Java writeTextOutput / binary書込、既存consumer例。
- 手順: text/binary各一commandで親あり・親なし・出力先directoryを観測。既存overwriteと親自動作成を別の軸にする。案Aはruntime差維持、案Bは共通で親なし拒否、案Cは共通で親を作成。各案のerror codeと副作用を列挙する。
- 完了: commandごとの現在値、採用案候補、互換性影響が決定記録にある。Javaが便利という理由だけでNodeを変更しない。
- 確認: DOC。再現はtest用temporary directory内で行い、実利用ファイルを使わない。

<a id="dec-03"></a>

### DEC-03 Java帳票optionの有効だった範囲を確定する

- 依存: PRE-01
- 対象: Java。F-S2、B17。解除対象G-REPORT。
- 入力・範囲: `ae71a6a`と`fa5f421`のCLI、runtime-java-cli、remaining-migration-items、upstream-followup-log。
- 手順: `before / after / display-mode / progress-mode / holiday-dates / label-mode`ごとに、旧dispatch→option helper→core callを追う。report command別に効果の有無を記録し、現在のallowlistとの差を示す。helperが読むだけでcoreに届かないoptionは有効と数えない。
- 完了: option×command表、値と既定値、削除意図の証拠または不足、推奨「既存Java extensionを限定復旧」が記録される。採用決定には復旧する組合せを列挙する。
- 確認: DOC。Nodeへの追加案は、独立した用途の明示がない限り作らない。

<a id="dec-04"></a>

### DEC-04 凍結I/O metadataのJava側方針を決める材料を集める

- 依存: PRE-02
- 対象: 両版。F-S4、B13。解除対象G-META。
- 入力・範囲: Node compatibility testの`keeps named file output...`、CLI review記録、Java診断生成、確認可能なSkills/MCPのconsumer。
- 手順: detect-kindとvalidate-patchそれぞれのfile/stdout時のmetadataを観測。consumerがio.outputに依存する範囲をsource付きで列挙する。案AはJavaをNode互換へ寄せる、案BはJavaの正確な出力先を明示例外として残す。
- 完了: Nodeの凍結挙動を維持したまま、Java側の選択に必要な影響・対象command範囲を記録。consumerが見つからない場合は調査したrepository/path範囲も残す。
- 確認: DOC。Nodeのcompatibility testを「誤った期待値」として書き換えない。

<a id="dec-05"></a>

### DEC-05 XMLのProject情報を対応づける

- 依存: PRE-01
- 対象: 両版。F-S3、D08。
- 入力・範囲: Node types / msproject-codec / xml周辺のProject処理、Java ProjectInfo・ProjectExtendedAttributeModel・XML reader/writer、既存class mapping。
- 手順: `docs/node-java-137-xml-field-inventory.md`（新規予定）にProject sectionを作り、XML tag、Node fieldとread/write、Java fieldとread/write、未設定/lexical/未知tag/loss、対応fixtureを列挙する。差分だけ履歴を追う。
- 完了: 両方に存在するfieldも含む対応表があり、差は「同等」「実装差」「明示的な対象外」「意図不明」に分かれる。関数名の違いだけで欠落と判定しない。
- 確認: DOC。製品sourceは編集しない。

<a id="dec-06"></a>

### DEC-06 XMLのTask情報を対応づける

- 依存: PRE-01
- 対象: 両版。F-S3、D08。
- 入力・範囲: Node TaskModel/types/codec、Java TaskModel・関連baseline/timephased/extended attribute class、XML reader/writer。
- 手順: DEC-05と同じ列でTasks sectionを作る。UID、階層、依存、日付/期間、進捗、actual/baseline/extended dataを区分。Java workbook拡張列とXML保持能力は別に記録する。
- 完了: task fieldのread/writeと依存関係・型変換の根拠を追える。日付丸めや未設定の差に証拠がなければ意図不明として残す。
- 確認: DOC。

<a id="dec-07"></a>

### DEC-07 XMLのResource情報を対応づける

- 依存: PRE-01
- 対象: 両版。F-S3、D08。
- 入力・範囲: Node ResourceModel/codec、Java ResourceModelと関連class、XML reader/writer。
- 手順: Resource sectionへidentity、rate/cost/work、calendar参照、baseline/extended dataのread/writeを同じ形式で記録。workbook列の有無をXML field有無の代わりに使わない。
- 完了: 各差にsource/test/履歴または不足証拠が付いている。
- 確認: DOC。

<a id="dec-08"></a>

### DEC-08 XMLのAssignment情報を対応づける

- 依存: PRE-01
- 対象: 両版。F-S3、D08。
- 入力・範囲: Node AssignmentModel/codec、Java AssignmentModelと関連class、XML reader/writer。
- 手順: Assignment sectionへtask/resource参照、units、work/cost、期間、timephased/baseline/extended dataを列挙。number文字列変換と未設定の扱いも別欄に記録する。
- 完了: read/write片側だけの対応も検出でき、暗黙のデータ保持を保証した表になっていない。
- 確認: DOC。

<a id="dec-09"></a>

### DEC-09 XMLのCalendar情報を対応づける

- 依存: PRE-01
- 対象: 両版。F-S3、D08。
- 入力・範囲: Node calendar/types/codec、Java CalendarModel / WeekDayModel / WorkWeekModel等、XML reader/writer。
- 手順: Calendar sectionへbase calendar参照、weekday/working times、exceptions/work weeksのread/writeを列挙。NonWorkingDaysのworkbook表現とXML構造は対応関係として記録する。
- 完了: collection順、参照解決、未知/欠落の扱いに証拠または未解決点がある。
- 確認: DOC。

<a id="dec-10"></a>

### DEC-10 XMLの差分ごとに判断案をまとめる

- 依存: DEC-05-DEC-09
- 対象: 両版。F-S3、D08。解除対象G-XMLの各field。
- 入力・範囲: 五domainのfield inventory、既存仕様・fixture・Release履歴。
- 手順: 各実装差を共通用途、runtime事情、意図的非採用の根拠で評価。差異維持、対応先を指定した実装検討、仕様判断の三分類へ落とす。対象fieldごとに意味・型・read/write・loss・受入fixture・移行の案を記録する。
- 完了: 未分類の差がなく、意図不明には必要証拠と提案がある。実装検討には一field単位でAPPLY-05へ渡せる入力がある。決定はfieldごとに状態管理する。
- 確認: DOC。v1のsemantic scope拡張はこのlegacy判断から自動承認しない。

<a id="apply-01"></a>

### APPLY-01 決定済みのhelp/option位置の扱いを反映する

- 依存: DEC-01
- 判断待ち: G-HELP
- 対象: 決定記録で指定したrepo。B03。
- 入力・範囲: 採用済みargv一覧と互換性方針、Node argv/entryまたはJava CLI、既存CLI tests。
- 手順: 差異維持ならdocs/testの期待を明記してsourceを維持。統一する決定なら指定argvだけを受理/拒否するよう入口を修正し、入力未読のcaseを追加する。root legacy helpとv1 controlsは別にする。
- 完了: 決定にある全argv例とexit/channelが確認できる。指定外aliasやoption順を追加しない。
- 確認: 変更先のN-FOCUS `tests/mikuproject-cli-argv.test.js tests/mikuproject-cli-compatibility-contract.test.js`、またはJ-FOCUS `MikuprojectCliRegressionTest,MikuprojectCliTest`。

<a id="apply-02"></a>

### APPLY-02 決定済みの親directory方針を反映する

- 依存: DEC-02、LEG-J05
- 判断待ち: G-PARENT
- 対象: 決定したrepoのI/O境界。B16。
- 入力・範囲: command×text/binary別の決定表、Node cli-ioまたはJava出力helper、対応I/O tests。
- 手順: 差異維持ならその例外を追記。統一なら親あり/なし・既存file・既存directoryの四条件をtest化してから対象helperだけを修正する。
- 完了: overwriteと親自動作成が決定どおり。書込失敗時にsuccessを出さず、入力を消さない。
- 確認: N-FOCUS `tests/mikuproject-cli-io.test.js tests/mikuproject-cli-review-regressions.test.js`、またはJ-FOCUS `MikuprojectCliRegressionTest`。

<a id="apply-03"></a>

### APPLY-03 決定済みJava帳票optionだけを復旧または明文化する

- 依存: DEC-03、LEG-J06
- 判断待ち: G-REPORT
- 対象: Java。B17。
- 入力・範囲: 採用したoption×command表、CLI allowlist / report helper / help、RegressionTest。
- 手順: 維持する組合せだけallowlistへ載せる。各optionの効果がcore出力へ届くfixtureと、非対象commandでの拒否caseを一組ずつ追加。削除を選んだ組合せは理由と移行を文書化する。
- 完了: 調整optionが単に受理されるだけでなく指定した効果を持つ。Nodeには追加しない。曖昧な組合せを一括許可しない。
- 確認: J-FOCUS `MikuprojectCliRegressionTest,WbsMarkdownTest,WbsSvgTest,WbsXlsxTest`、J-PARITYの既定option case。

<a id="apply-04"></a>

### APPLY-04 決定済みmetadata互換方針をJavaへ反映する

- 依存: DEC-04、LEG-J10、LEG-J11
- 判断待ち: G-META
- 対象: Javaの診断と例外docs。B13。
- 入力・範囲: 採用したcommand範囲、CLI buildIoDiagnosticsの対象呼出し、RegressionTest / parity test。
- 手順: 厳密互換を選んだcommandだけNodeの既存metadataと比較。Java例外維持なら実際のfile/stdoutを期待し、例外としてdocsへ記録する。
- 完了: 正常/失敗とfile/stdoutの組合せが決定に対応。Node凍結testは無変更。比較を通すための無差別なmetadata除外を行わない。
- 確認: J-FOCUS `MikuprojectCliRegressionTest`、J-PARITY。

<a id="apply-05"></a>

### APPLY-05 決定済みXML fieldを一件ずつ反映する

- 依存: DEC-10
- 判断待ち: 対象fieldのG-XML
- 対象: 決定記録で指定したrepo。一回の作業キーは`APPLY-05:<domain>:<XML-tag>`。
- 入力・範囲: 確定した意味・型・read/write・loss・移行・fixture、field inventoryに挙げたmodel/codec/validatorと対応test。
- 手順: 一fieldのread/write fixtureと未設定/不正値をtest化。指定した最小のmodel/codec変更を行う。差異維持のfieldならsourceは変えず対応表とtest根拠を更新する。
- 完了: 元のprojectの他field/参照/collection順を維持し、指定fieldの往復・loss/診断が契約どおり。他fieldを同時に移植しない。残るfieldは別作業キーで追跡する。
- 確認: 対応する既存Node roundtrip/core test、またはJ-FOCUS `MsProjectXmlTest,MsProjectSamplesTest`とdomainの既存test。Node TS変更ならbuild:coreも行う。確認できない新規契約をその場で作らない。
