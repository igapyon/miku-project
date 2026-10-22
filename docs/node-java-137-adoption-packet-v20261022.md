# Node / Java #137 採択判断パケット — 2026-10-22

この資料は、#137比較で残った選択肢を、変更対象・互換影響・受入確認・次の作業へ結びつけるレビュー用パケットである。**未決定項目の推奨は提案であり、採択とは区別する。**`--max-depth`上限100だけは利用者が2026-10-23に選択し、I137で実装した。F-S5 / F-S6の判断は未決定のままである。

根拠の詳細は[判断記録](node-java-137-decisions.md)、[XML field inventory](node-java-137-xml-field-inventory.md)、[reference更新案](node-java-137-reference-update.md)、[機能差分表](node-java-feature-union-v20261022.md)、[残作業計画](node-java-work-plan-v20261022/remaining-work.md)を参照。

## 既存legacy判断

| Gate / 判断 | 提案 | 主な対象と互換影響 | 採択後の受入確認 | 次のカード |
| --- | --- | --- | --- | --- |
| G-HELP / DEC-01 | **Aを提案**。現在のCLI grammarとJavaの`help` / `-h` / `version` aliasを維持して文書化 | Java CLI grammar・help。Bはcommand後helpの`unknown_option`結果を変え、CはNode/Java双方のcontrol位置とaliasを広く変える | root help、command後`--help`、未知command、option-before-command、Java aliasについて採択した差だけを回帰化 | APPLY-01 |
| G-PARENT / DEC-02 | **Aを提案**。Nodeはmissing parentで失敗、Javaは親を作成する現状を維持して明記 | 両CLIのtext/binary file output。BはJava利用者の便利動作を削除、CはNodeで意図しないdirectory作成を増やす | missing / existing parent、file target / directory target、text / binaryの成功・失敗と入力保持を両版で確認 | APPLY-02 |
| G-REPORT / DEC-03 | **Aを提案**。過去に実効性が確認でき、文書にも記載されたoption × report commandだけJavaで復旧 | Java report allowlistとCLI test。Nodeのcommand面は変更しない。無効な組合せを一律受理しない | `--before/--after`、display/progress mode、holiday、labelの各有効組合せで出力差を確認し、無効組合せと`report mermaid`を拒否 | APPLY-03 |
| G-META / DEC-04 | **Bを提案**。Javaは実際の出力先を示し、Nodeの`detect-kind` / `validate-patch` frozen stdout metadataを例外として記録 | Javaの`io.output`、Nodeの互換metadata。調査したMCP / Skill経路はこのfieldを読まず、named outputも提供しないが、外部CLI利用者への依存は未確認 | stdout / `--out -` / named fileのprimary artifactとdiagnostic metadataを別々に固定。Node frozen testを維持 | APPLY-04 |

いずれも現在は**未決定**である。APPLY開始条件は、該当Gateの選択と影響範囲の記録である。

## G-XML / DEC-10 — fieldごとのlegacy XML判断

適用範囲は現在のlegacy `ProjectModel` XML codecのみ。v1 strict subsetのunsupported-element規則を流用しない。APPLY-05は採択されたfield単位で実行する。

| 対象 | 提案 | 影響 / 受入確認 | 次の作業 |
| --- | --- | --- | --- |
| 省略時の`Task/OutlineLevel`、`Task/PercentComplete`、`PredecessorLink/Type`、`Resource/Type`、`Calendar/WeekDays/WeekDay/DayType` | 各fieldでA: JavaにNode defaultを採用、B: NodeにJavaの省略を採用、C: 差異維持を選ぶ。**現時点の提案は各C** | absent / explicit zero-or-default / populatedを別々にparseし、modelと再exportを確認。省略を暗黙に明示値へ変えない | APPLY-05のfield別card |
| `Task/PredecessorLink/PredecessorUID` forward reference | **Javaの二段階validator候補**。全Task UIDを先に集め、その後linkを検査 | 先行Taskから後続Taskへの参照が通り、未知UIDは失敗し、Task/link順序が保たれる | 採択後APPLY-05 |
| 未知・未model化XML要素 / attribute | A: reject/warn、B: 現状のmapped lossy subsetを文書化、C: opaque保存。**Bを提案** | legacy codecが未知要素を保持しない制約を明記。rejectやopaque field追加は互換・model scopeを広げる | 採択後、docsとfixtureをfield/domain単位で更新 |
| integer-like / decimal XML数値 | blanket normalizationをせず、現状差を維持。共有が必要なtagだけ範囲・精度・fraction・error policyを決める | tagごとの境界fixtureを追加し、値の意味とXML bytesを別に比較 | 必要になったtagの個別card |
| Calendar nested container、invalid date、timezone、空白時刻などのedge cases | 新たな対応要件が定義されるまで現状を維持 | valid direct-child fixtureを基準とする。サポート範囲を広げる場合は専用fixtureを追加 | 新要件発生時に再評価 |

**選択欄: 未決定。** unknown XML policyとforward-reference修正も、提案記録だけで実装許可にはならない。

## G-REFERENCE — source identityと生成digestを分けて判断

| 判断段階 | 提案 | 影響 / 受入確認 | 次の作業 |
| --- | --- | --- | --- |
| Source identity | Node `v1.1.1` / `9a9f562c03d28f1b0f3c809226dc61d0cd9d5f7e`から**新しいinternal reference candidate**を作成。既存`v1.0.3`とG4 lockは不変 | exact tag/commitのclean checkoutでbuild。contract version 1、fixture suite 1、corpus digest `f0b4a821f80f155ba01afc1fdf7c5d2fa6ca5e744bbd0090819e0d591f1c47a3`は維持。公開Releaseではない | REF-02 |
| Generated identity | REF-02が実際に生成・検証したmanifest / three-member hashes / outer-lock digestを、**source adoptionとは別に**レビュー・採択 | isolated candidate workflowでmanifest、executable、source archiveを検証し、サイズ・SHA-256を照合 | REF-03 → REF-04 → REF-05、既存P5-C1承認 |

**source採択: 未決定。digest採択: REF-02の候補生成前のため未提示・未決定。** dirtyな`1.1.2` metadataはtagやreference identityとして扱わない。

## 実行中に発見したlegacy判断

### F-S5 / B23 — AI projectionの未設定値

観測: 同じstateの`ai export task-edit`とbundleで、未設定`target_task.notes`はNodeが省略、Javaが`""`。`calendar_uid`はNodeが`null`、Javaが`""`。数値`24` / `24.0`の表記差は別の字句差である。

consumer確認: ローカルの`mikuproject-mcp`はtask-edit projectionをartifact/stdoutとして公開し、runtime JSONの各fieldを正規化しない。`mikuproject-skills`はtask-editを局所編集workflowに使い、date-onlyの例も持つが、`notes` / `calendar_uid`のabsent・null・emptyの優先規則は見つからなかった。外部consumerの依存は未確認である。

既存のpatch input contractはprojection outputとは別である。Node AI JSON specは`update_task.notes` / `calendar_uid`の空文字をclear、unknown calendar UIDをwarning-and-ignoreとする。Node patch実装は省略時に保持し、null等のnon-stringをwarningにする。R2F-03 D07ではNodeがUID `1`のnameを変更、Javaは`update_task` unsupported warning 1件で値を維持しexit 0だった。I137でJava dispatchと9 fieldを実装した。2026-10-23の後続対応で進捗率2 fieldもNode/Java双方で整数0〜100に揃え、小数・範囲外はwarning-and-preserveとした。日時setterは既存Java helperを利用し、Nodeが受理するspace-separated datetimeをJavaがwarningにする差を記録した。F-J6は日時parser差のため部分対応であり、projection shapeの判断とは独立する。

| 案 | 内容 | 互換影響 |
| --- | --- | --- |
| A | 省略・null・空文字をfieldごとに一つのshared shapeへ揃える | AI consumerの分岐を減らす一方、projectionとprompt inputを変更する |
| B | 現在のruntime差を明示的なlegacy exceptionとして維持する | 既存出力を保つが、consumerは両方のshapeを扱う |
| C | 編集意味に関係する`notes` / `calendar_uid`だけ規則を定義する | 変更範囲を狭めるが、他fieldの出力shape差は残る |

**提案: Cをconsumer ownerと確認した後にfield別採択。現時点では未決定。** 受入時はprojection側の省略/null/空文字/値ありをtask-edit・bundleで検査し、patch inputの既存Node意味（省略=維持、空文字=clear、null=型warning、unknown calendar=warning/ignore）と混ぜない。Java update_task実装を含めるかは別途採択する。次はREM-13。

### F-S6 / B24 — date-only、local datetime、空cell

**日時精度・時刻補完・datetime区切りの変更は後続Issue [#138](https://github.com/igapyon/miku-project/issues/138)へ延期する。** 当面は現行動作を維持し、NodeまたはJavaの変換を共通仕様として採択しない。null / empty cellと未指定patchの意味はIssue #138の対象外で、引き続き未決定。

観測: `state summarize` / `apply-patch`でNodeは`2026-04-01`を保持し、Javaは09:00 / 18:00のlocal datetimeへ変換するcaseがある。Java workbook JSONは一部のNode `null`を空文字にする。LEG-J16ではlocal datetime separatorがspace / `T`で異なる。入力draft・patchは変更されなかった。

consumer根拠: `mikuproject-skills`のWBS例やpromptに`planned_start` / `planned_finish`の日付文字列がある。これは日付専用の利用例だが、Javaの時刻補完を無効とする共有仕様の証明ではない。MCP / Skill側の全consumerがnullと空文字を同じ意味に扱う証拠はない。

| 案 | 内容 | 互換影響 |
| --- | --- | --- |
| A | 対象fieldと入口を限定し、date-only精度とnullをJava shared pathsで保持する | Javaのschedule補完やmodel変換結果を変える可能性がある |
| B | Javaの09:00 / 18:00とempty-cell表現を共通出力にし、Nodeを変更する | Node出力とpatch consumerの値が変わる |
| C | runtime差を維持し、入口・fieldごとに文書化する | 既存値を保つが、共有consumerがruntime差を処理する |

**提案: 日時精度と空cellを別々に採択し、入口・field・patch未指定と明示消去を区別する。現時点では未決定。** 日時補完を採択する場合も、AI specのdraft-generation記載は通常taskの09:00/18:00補完に限り、summary taskの日付許容を通常taskの補完規則へ拡張せず、`is_milestone=true`はその補完から除外する。この記載をProject fieldや既存workbook importへ一般化しない。受入時はsummarize/apply-patch/export/importをdate-only・明示datetime・null・empty・omitted patchで、通常/summary/milestoneを分けて確認する。次はREM-14。

R2F-03の[最新probe evidence](node-java-137-review-evidence-v20261022.md#r2f-03)では、22独立caseを両runtimeで実行（44 runs、failure 0、0 input hash changes）。ProjectとTaskのdate-onlyはempty patchでもJava import段階でstart 09:00 / finish 18:00へ変換し、Nodeはdate-onlyを維持。通常/summary/milestoneを個別に実測し、3種類ともこのJava変換を観測した。space/Tの違い、unrelated `update_project`、unsupported Java `update_task`も分けている。Project Title/AuthorとCalendar BaseCalendarUIDのnull/empty/omittedはNode null / Java empty string、Task Notes/CalendarUIDはこのfixtureでは両方nullになった。結果とsource経路はfield別に記録したが、どの案も採択していない。

| 対象route / entity | fields / input | A: input精度・nullを保持 | B: NodeをJava observed outputに合わせる | C: 現在のruntime差を維持 | 決定 |
| --- | --- | --- | --- | --- | --- |
| state apply-patch / Project | StartDate, FinishDate: date-only | Javaもdate-onlyを保持 | Nodeをstart 09:00 / finish 18:00へ | Node date-only / Java 09:00・18:00 | 変更を後回し（Issue #138） |
| state apply-patch / normal Task | Start, Finish: date-only | Javaもdate-onlyを保持 | NodeをJava observed 09:00・18:00へ | runtime別の現在値 | 変更を後回し（Issue #138） |
| state apply-patch / summary Task | Start, Finish: date-only | Javaもdate-onlyを保持 | NodeをJava observed 09:00・18:00へ | runtime別の現在値。summary許容をtime defaultとみなさない | 変更を後回し（Issue #138） |
| state apply-patch / milestone Task | Start, Finish: date-only | Javaもdate-onlyを保持 | NodeをJava observed 09:00・18:00へ | runtime別の現在値。draft specのmilestone除外はimport ruleではない | 変更を後回し（Issue #138） |
| state apply-patch / Project & Task | explicit local datetime: space / `T` | supplied lexical formを出力まで維持 | 片方のseparatorへ統一 | Node space / Java `T` | 変更を後回し（Issue #138） |
| workbook JSON Project | Title / Author: null, empty, key omitted | null / absentを区別可能な形で保持 | NodeをJava empty stringへ | Node null / Java empty | 未決定 |
| workbook JSON Calendar | BaseCalendarUID: null, empty, key omitted | null / absentを区別可能な形で保持 | NodeをJava empty stringへ | Node null / Java empty | 未決定 |
| workbook JSON Task | Notes / CalendarUID: null, empty, key omitted | value shapeを個別に定義 | 両runtimeの形を統一 | このfixtureのoutput nullを維持 | 未決定 |
| apply-patch field omission | operation field omitted | setter omissionをimport conversionと別に規定 | full CLI outputを揃える | import変換を含むruntime動作を維持 | 未決定 |

表のblank-field outcomeはこのworkbook routeのfixture結果であり、patch clear規則や全inputの一般化ではない。Javaの`normalizeDateTime`はProject/Task import時に実行され、Task datesはMilestone flagを読み込む前に処理される。Nodeのintermediate modelは直接観測せず、source-derivedと記す。D07のJava未対応operationは、Java task-update setterで日時をどう扱うかの証拠にはならない。日時関連の選択はIssue #138へ延期し、null / empty cellとpatch omissionの選択は未決定のまま。

### `--max-depth`上限 — LEG-J08

観測: Javaは`Integer` API、Nodeはfinite JavaScript `Number`を使う。200桁の正整数はNode 20でfinite valueとして受理され、Javaは`Integer`変換でexit 1 / `command_error`となった。MCP schemaは`maxDepth`をintegerかつnonnegativeとしている。

| 案 | 内容 | 互換影響 |
| --- | --- | --- |
| A | 共通上限を`2,147,483,647`とする。超過は両版でusage error `invalid_integer_option`、artifactなし | Nodeが現在受理する巨大値を制限するが、実用的な階層深度を超える入力のみに影響 |
| B | Javaのdepth APIをlong等へ広げ、共通の安全な上限・字句精度を別途定義 | Java APIと呼び出し元を変更し、Nodeのsafe-integer境界も決める |
| C | runtime固有rangeを維持し、Java overflowを別途diagnostic契約化する | 最小変更だが、同じ大値の受理差を残す |

**採択済み（2026-10-23）: 上限100。** Node CLI、Java CLI、MCP schemaで0〜100を受理し、未指定は従来どおり無制限とする。上限超過・巨大値・invalid lexemeはusage/schema errorとして拒否する。これは元案AのJava `Integer.MAX_VALUE`ではなく、実用的な階層深度を優先した選択である。CLI/MCP実装と回帰は[I137結果](node-java-work-plan-v20261022/implementation-plan-v20261023.md)に記録した。直接core APIは変更していない。

## 判断記録欄

各項目について、採択者・日付・選択案・対象scope・追加条件を、判断後に[判断記録](node-java-137-decisions.md)へ追記する。この資料の作成や推奨文はGate承認ではない。
