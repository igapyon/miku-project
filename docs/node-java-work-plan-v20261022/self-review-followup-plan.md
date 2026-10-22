# 再自己レビュー5指摘の対応計画 — Luna実行用

作成日: 2026-10-22。状態: **完了。R2F-00〜07実行済み。実行担当はLuna。** 各実行結果と変更pathは共有記録のR2F anchorを参照する。

この計画は、先行の[RPF計画](self-review-fix-plan.md)を再レビューして見つかった5件に対応する。RPFの実行履歴と成功ログを保持し、未達だった完了条件を再確認する。元75カード、REM18カード、RPF10カード、今回のR2F8カードは別集計とする。

## 指摘と修正後の状態

| 指摘 | 問題 | 担当 | 解消条件 |
| --- | --- | --- | --- |
| RV2-1 / P2 | Java `update_task`不足がprojection判断に埋もれている | R2F-01 | 独立ID・対応候補・対象field・受入条件があり、C07/C11/D11から追跡できる |
| RV2-2 / P2 | UID欠落のreplace確認が無い | R2F-02 | header欠落と単一rowのUID欠落について、replace/mergeの公開結果を検査・説明できる |
| RV2-3 / P2 | 空patchでも起きるimport時の日時変換が資料で不明確 | R2F-03 | import→patch→exportの段階、field省略、日付精度、task種別を区別した根拠表がある |
| RV2-4 / P2 | F-J1に224件・2失敗が現状として残る | R2F-04 / 07 | 古いrunは履歴、最新runは実測として区別し、F-J1/F-J2/F-J5と各追跡先が一致する |
| RV2-5 / P3 | `#rpf-07`参照先が無く、link確認がfile存在だけ | R2F-05 / 07 | 対象fragmentが実在し、fileとfragmentを別々に検査した結果が残る |

## 範囲・既知状態・権限

| 記号 | path |
| --- | --- |
| Node | `/Users/igapyon/Documents/git/miku-project` |
| Java | `/Users/igapyon/Documents/git/miku-project-java` |
| J-MAIN | Javaの`src/main/java/jp/igapyon/mikuproject/` |
| J-TEST | Javaの`src/test/java/jp/igapyon/mikuproject/` |
| 共有記録 | Nodeの既存`docs/node-java-137-review-evidence-v20261022.md`へR2F節を追加する |
| 生ログ・probe・checker | Nodeの`workplace/node-java-137/<R2F-ID>/`。Git管理へ加えない |

- 計画時のNode HEADは`9a9f562c03d28f1b0f3c809226dc61d0cd9d5f7e`、Java HEADは`c0b44214c8bc5ccd8722fd47f7ae98562b6e1643`。実行時に取り直す。Javaの先行実装/version commitを保つ。
- Nodeには既存のhelp/test/version/docs変更と未追跡文書がある。Javaの既存dirtyは`TODO.md`、`docs/remaining-migration-items.md`、`ProjectXlsxTest.java`。reset/stash/restoreで開始状態を作らない。
- 今回の実行対象は**追跡文書、Javaの公開API回帰test、限定probe、確認・引渡し**。Java `update_task`本体の実装は独立の将来候補へ分解する。
- F-S5/F-S6、duplicate header、既存Gateの未決定値は採択しない。既に仕様があるpatch入力規則まで新たな仕様判断待ちへ戻さない。
- schema、production source、snapshot/golden、G4 lock、vendor、依存/versionを変更しない。source変更が必要と分かったcaseは根拠と対応候補を記録する。
- Java書込やtestが実行環境の許可対象なら、対象file/commandを特定して正式な承認手続きを使う。別copyで既存checkoutを上書きしない。
- commit/push、GitHub投稿・Issue登録は範囲外。ローカル草案も、R2F-07に列挙した現状更新だけを扱う。

再自己レビュー時に一時probeで確認した値は次のとおり。**将来の実行結果ではない。** probeは保存済みsuiteや共通仕様の代わりにしない。

| case | Node | Java |
| --- | --- | --- |
| `update_task`でUID `1`のnameを変更 | `REVIEW-UPDATED`へ変更、exit 0、warning 0 | `First`のまま、exit 0、未対応op warning 1 |
| Task UID headerを除去したsample workbook | このprobeでは未確認 | base 13 task、replace 0 task、merge 13 task |
| milestone Start/Finish=`2026-04-01`へ空patch | date-only保持、exit 0、warning 0 | Start=`2026-04-01T09:00:00`、Finish=`2026-04-01T18:00:00`、exit 0、warning 0 |

## 実行順と依存

| ID | 作業 | 依存 | 状態 |
| --- | --- | --- | --- |
| [R2F-00](#r2f-00) | baseline・再確認状態を記録 | なし | 完了 |
| [R2F-01](#r2f-01) | `update_task`差を独立候補へ分離 | R2F-00 | 完了 |
| [R2F-02](#r2f-02) | UID欠落のreplace/merge回帰 | R2F-00 | 完了 |
| [R2F-03](#r2f-03) | 空patchの変換経路とfield表を補正 | R2F-01、R2F-02 | 完了 |
| [R2F-04](#r2f-04) | F-J1等の履歴/現在結果を整理 | R2F-00 | 完了 |
| [R2F-05](#r2f-05) | 明示anchorとfragment検査 | R2F-01、R2F-03、R2F-04 | 完了。14 documents; 1012 extracted refs, 705 local paths/0 missing, 84 fragments/0 missing, 0 duplicates |
| [R2F-06](#r2f-06) | 変更後のJava最終確認 | R2F-02、R2F-03 | 完了。importer 12/12、Maven 229/0/0/11 skip、verifier 8/8 |
| [R2F-07](#r2f-07) | 指摘別closeout・集計・草案・最終review | R2F-01〜06 | 完了。RV2-1〜5、91-row count, local drafts, final status/diff checks recorded |

Lunaは表の順に一枚ずつ進める。依存が未達なら完了にしない。環境不足や既存契約との衝突は、対象caseだけの不足として記録する。

<a id="r2f-00"></a>

## R2F-00 — baselineと未達条件の記録

入力: 本書、共通[README](README.md)、[共有記録](../node-java-137-review-evidence-v20261022.md)、両repoのstatus、既存RPF-08 logs。

1. 各repoで`git status -sb`、`git rev-parse HEAD`、`git diff --stat`を保存する。対象test/sourceとversion/vendorに実行前からある差分を区別する。
2. Node20実行file`/opt/homebrew/opt/node@20/bin/node`、Java、Mavenのversionを取り直す。不足toolchainを別versionへ勝手に置き換えない。
3. 共有記録に明示anchor付き`R2F-00`〜`R2F-07`節を追加する。各結果は入力、source、観測/source由来、変更path、command、exit、test数/failure/error/skip、残件を持つ。
4. RPF-02/03/04/05/06/07/09の完了条件を「再確認中（対応R2F）」として入口から読めるようにする。過去の実行済み記録は消さない。RPF-01の診断testとRPF-08の成功run自体を失敗へ書き戻さない。
5. 元75カードをtask-indexの表行から再集計する。開始時の記録は37完了・2判断待ち・36未着手。今回の新規カードを加算しない。

完了: 現在checkout、既存変更、再確認先、再利用する過去runが判別できる。baseline取得だけで製品testを再実行しない。

<a id="r2f-01"></a>

## R2F-01 — Java `update_task`を独立した実装候補へ分離

変更先: 比較表、判断記録、採択資料、remaining-work、共有記録。Java productionと製品testは変更しない。

読むsource: Node `project-patch-json-core.ts`のdispatch、`project-patch-json-updates.ts`の`applyUpdateTaskOperation`、AI JSON specのupdate_task。Java `ProjectPatchJsonCore.java`、`ProjectPatchJsonUpdates.java`、CLIのapply/validate経路。

1. 実行時に比較表の実際の機能行とF-*一覧で`B26` / `F-J6`が未使用か検索する。本計画内の予約名・例文は衝突に数えない。未使用なら今回の独立IDとして使う。衝突していたら既存IDを再利用せず、次の空きIDを決めて対応表を記録する。
2. 新機能行B26へ「Nodeは`update_task`をdispatch、Javaは未対応warningで無視しexit 0」を記載する。R2F-03の実測後にsource由来から観測済みへ更新する。C07/C11/D11とB23からB26へ案内する。
3. F-J6を独立した**未着手の将来実装候補**にする。F-S5はprojection形、F-J6はpatch入力対応と明記する。F-S5の採択が全patch入力対応を一括で遮断するように書かない。
4. Node側の対象fieldを列挙する: `name`, `notes`, `calendar_uid`, `percent_complete`, `percent_work_complete`, `critical`, `is_milestone`, `planned_start`, `planned_finish`, `planned_duration`, `planned_duration_hours`。Java utilに関数があることとdispatch対応済みを混同しない。
5. F-J6の将来作業欄に、少なくとも次の受入caseと変更対象classを書く。**このカードでは実装もtest追加も行わない。**

| 将来case | 採用済み入力規則から確認する内容 |
| --- | --- |
| UT-01 name | 有効UID・非空nameで変更、別taskは維持。空name/未知UID/fields非objectのwarningと非更新 |
| UT-02 notes | 値あり更新、空文字clear、省略維持、null/非stringはwarning・非更新 |
| UT-03 calendar_uid | 既存UIDへ変更、空文字clear、省略維持、未知UID/null/非stringのwarning・非更新 |
| UT-04 numeric/boolean | percent系の0/通常値/100と型・範囲外、critical/is_milestoneの型。実際のNode仕様を受入欄へ引用する |
| UT-05 duration | durationとhoursの単独指定、両方指定、型・負値、milestone制約をsourceで特定 |
| UT-06 dates | field省略、date-only、space/T、通常/summary/milestoneを分ける。F-S6に未決定の値は決定済みの期待値として実装指示へ入れない |

6. 将来のproduction候補はJava `ProjectPatchJsonCore`のdispatch、`ProjectPatchJsonUpdates`のtask更新、関連testとする。既存input contractの実装と未決定日時policyの変更を別sliceにできるよう依存を書く。
7. 機能行が90→91となる場合、C/E/B/D/V/Rの期待ID集合、比較表/TODO/README等の**現在件数**を更新する。実行前に別の機能行が増えていたら実際の集合から算出する。RPF-07の90件監査run/tableは履歴として残し、今回変更する行とB26はR2Fの現在監査表へ記録する。F-J6を元75/REM18の完了数へ加えない。

完了: operation全体の不足が独立に追跡でき、projectionの採択と混同されない。将来の実装範囲と未決定項目が明示されている。

<a id="r2f-02"></a>

## R2F-02 — UID欠落をreplace/mergeで確認

変更先: Java `J-TEST/projectxlsx/ProjectXlsxTest.java`、共有記録のRPF-02/03補足。既存public APIとfixtureを使う。

最初に`ProjectWorkbookJsonImport.importTaskRowsAsProjectModel`のUID空欄skip、mergeの`findTask`経路、`ProjectXlsxImport`の2つの公開入口、既存spec/validatorを読む。現状と明文contractが衝突したらそのcaseを保留し、誤った新仕様をtestで確定しない。

1. 既存`missingUidAndShortRowsDoNotBorrowOtherTaskValues`を、UID header欠落とshort rowのcaseに分けて読みやすくする。既存sentinel/normal-row assertionを保持する。
2. 以下をfresh workbookで作る。header/data row indexは`ProjectWorkbookSchema`定数、照合はUIDを使う。先頭row削除でindexがずれた結果を別taskと取り違えない。

| case | 操作 | replace: `importProjectWorkbookAsProjectModel` | merge: `importProjectWorkbookDetailed(workbook, base)` |
| --- | --- | --- | --- |
| U01 UID header欠落 | hierarchy fixtureのUID列をheader/dataから削除。Nameは`NO-UID-SENTINEL`へ変更し、baseと異なる値にする | 現在sourceではTask全rowをskipし0件。空結果と、例外の有無を明示する | baseのtask数・UID・name・`KEEP-NOTES`を保持し、sentinelを反映しない |
| U02 一rowのUID cell欠落 | headerを保持し、対象rowのUID cell.valueだけnullへ。別正常rowのNameを`NORMAL-ROW-SENTINEL`へ | 対象UIDは無く、数はbaseより1少ない。正常UIDは存在しsentinelを保持 | 対象UIDのbase値を保持。正常UIDにはsentinelを反映 |
| U03 trailing Notes欠落 | 現行short-row caseを保持。末尾Notes cellだけ除去し別正常rowのsentinelを設定 | 未設定Notesの現在defaultを確認し、別正常rowは存在 | 対象`KEEP-NOTES`を保持し別正常rowは更新 |

3. U01は「UID headerが無いので全rowがidentityを失う」、U02は「一rowだけidentityが無い」と区別する。全rowに正常UIDが無いU01で、正常別rowの存在を要求しない。
4. base modelが前後で変更されていないことを、対象・正常taskのUID/name/notesで確認する。期待task数はfixtureから取得し、sampleの13件を固定値にしない。
5. 共有記録へreplaceのTask消失とmerge保持を明記する。これを安全な共有header policyの採択と呼ばない。header warning/errorのAPI戻り値が無い制約を保持する。

確認（cwd=Java、変更後に一度実行）:

```sh
mvn -B -Dtest=ProjectXlsxTest,CoreApiWorkbookTest test
```

完了: U01〜03の公開値と件数assertionが成功し、列位置のprivate helperを写すtestになっていない。現在test数を保存し、旧16件を転記しない。console logをR2F-02へ保存する。

<a id="r2f-03"></a>

## R2F-03 — 空patchとimport変換の段階を具体化

変更先: 共有記録、判断記録B24/F-S6、採択資料。sourceとgoldenは変更しない。R2F-02成功後のJava classesを使い、同じsourceの追加buildを行わない。

### 再現fixtureとcommand

1. Java追跡fixture`src/test/resources/node-java-137/BASE.json`を読んでNode `workplace/node-java-137/R2F-03/`へcopyする。元fileは変更しない。
2. Project rowsへStartDate/FinishDateを補い、UID `1` taskへStart/Finishを補う。基本日付は`2026-04-01`。task種別は`Summary`/`Milestone`を両方明示する。UID `2`の別taskは維持する。
3. 次のcaseは毎回fresh copyで作る。表の日時値はProject StartDate/FinishDateとTask Start/Finishの両方へ設定する。patchはE=`{"operations":[]}`、P=`{"operations":[{"op":"update_project","fields":{"name":"REVIEW-PROJECT"}}]}`、U=`{"operations":[{"op":"update_task","uid":"1","fields":{"name":"REVIEW-UPDATED"}}]}`。

| case | task種別 / 値 | patch | 目的 |
| --- | --- | --- | --- |
| D01 | 通常、date-only | E | fieldが無くても起きる読込/再出力変換 |
| D02 | summary、date-only | E | summaryを通常taskから外挿しない |
| D03 | milestone、date-only | E | 09:00/18:00とmilestone flagの実際の組合せ |
| D04 | 通常、`2026-04-01 10:00:00` / `2026-04-01 16:00:00` | E | space/Tの字句変換を日付精度と分離 |
| D05 | D04と同値の`T`表記 | E | 明示時刻の値を保持する範囲 |
| D06 | 通常、date-only | P | unrelated project更新とtask field省略を区別 |
| D07 | 通常、date-only | U | B26の実行差。nameとwarningを必ず確認 |

4. 追加のblank caseは、Project Title/AuthorとTask Notes/CalendarUIDを**null/空文字/キー省略**のfresh fixtureに分け、Eで確認する。nullと空文字を同じcaseへ上書きしない。Calendar BaseCalendarUIDは同様に読込/出力経路をsourceで追い、未観測ならsource由来と明記する。
5. 各caseを両runtimeで実行する。Node cwdはNode、Java cwdはJava。`<state>`、`<patch>`、`<out>`はcase/runtimeごとの絶対pathを使い、同じ出力fileを両版で上書きしない。

```sh
/opt/homebrew/opt/node@20/bin/node scripts/miku-project-cli.mjs state apply-patch --state <state> --in <patch> --out <node-out> --diagnostics json
java -cp target/classes jp.igapyon.mikuproject.cli.MikuprojectCli state apply-patch --state <state> --in <patch> --out <java-out> --diagnostics json
```

stdout/stderr/exitを別fileへ保存する。fixtureの前後hashを比較し、state/patchを変更していないことを確認する。Java classのcompile状態をR2F-02のMaven結果へ結び付ける。

### source対応表と判断資料

6. 出力からProject StartDate/FinishDate、Task Start/Finish、Summary/Milestone、Notes/CalendarUID、exit/warning_count/warningsを抽出する。raw出力を保存し、比較のためのdate/null正規化をしない。
7. Javaは`MikuprojectCli.importWorkbookJsonModel`→`ProjectWorkbookJsonImport.importProjectWorkbookJsonAsProjectModel`→`importProjectRows`/`importTaskRowsAsProjectModel`→`normalizeDateTime`→patch dispatch→workbook exportの順で追う。Task start/finishがmilestone flag設定前に変わる位置を明示する。Nodeの対応する読込/patch/export関数も記す。
8. 表は`入口 | field | task種別 | 入力精度/値 | patch key有無 | 読込後model | patch操作による変更 | 出力値 | 最初の変換関数 | 根拠区分`とする。観測していない中間modelはsource由来と記す。
9. 「patch setterは省略fieldへ代入しない」と「CLIの出力値が変わらない」を別の主張にする。D03/Eで時刻が付いた場合は、空patchでもimportが変換した事実とwarning有無を記す。
10. Javaの`normalizePatchedPlainDateTime`呼出しをTask updateの根拠にしない。update_project/update_assignment/add系と、未対応update_taskを区別する。F-S5入力表もこの区分へ合わせる。
11. F-S6のA/B/C案はProject/Task、入口、通常/summary/milestone、date-only/字句/null/empty/省略を指定した選択欄へ分解する。既存draft生成specの範囲を一般workbookへ広げない。資料が揃っても採択は未決定のままにする。

完了: no-op patchの実効結果と最初の変換箇所が辿れ、未指定fieldを無条件の出力保持と説明していない。B26/D07のNode変更・Java未対応warningも独立候補へ反映される。

<a id="r2f-04"></a>

## R2F-04 — F-J1を含む現在結果と履歴の整理

変更先: 比較表F-J1/F-J2/F-J5、共有記録、Node TODO/worklog、plan README/remaining-work/closeout、必要なJava tracking。

1. `224` / `225` / `229` / `2件` / `2 failures` / `RPF-08で.*予定`等を対象文書で検索する。履歴本文は削除せず、どのrunか分かる見出し・日付・source状態を付ける。
2. F-J1の224件・2失敗をhistorical END-02の結果と明記し、既存RPF-08成功runへの参照を追加する。F-J2の34/34もそのfocused runの履歴であり、新しいrun件数に使わない。
3. R2F-06前は「RPF-08: 229 tests / failure 0 / error 0 / skip 11、R2F追加test後の全体確認はpending」と記載する。229を新test後の成功結果として転記しない。
4. F-*を機能行C/E/B/D/V/Rとは別に個別確認する。各follow-upの対象row、状態、根拠、次作業を監査記録へ残す。単にID数だけを検査してdoneにしない。

完了: 古い2失敗を現在の失敗として読ませる記述が無く、最新確認pendingも分かる。最終件数への置換はR2F-07で行う。

<a id="r2f-05"></a>

## R2F-05 — 明示anchorとfragment検証

変更先: 共有記録、比較表のevidenceリンク、今回触った追跡文書。checkerはignored workplaceへ置く。

1. 共有記録のRPF節へ`<a id="rpf-00"></a>`〜`<a id="rpf-09"></a>`を追加する。R2F節も`r2f-00`〜`r2f-07`を明示する。ID重複0を検査する。
2. `[review-evidence]`の`#rpf-07`を実在させる。各rowの主な現在根拠は可能な限りRPF-01/03/04、R2F-01/02/03/06等の該当結果へ向ける。監査表の同じrowへ戻るだけの循環参照をsource/testの証拠にしない。
3. 相対inlineリンクとreference definitionから、URLのpathとfragmentを別々に取り出す。外部URLは今回のローカル存在検査へ含めない。fragment-onlyリンクは当該fileを対象にする。コードブロック内の例を実リンクとして数えない。
4. file存在とfragment存在を別集計する。fragmentは明示HTML anchorまたは実際のMarkdown見出しanchorを照合する。Markdownのheading全文を無視して`RPF-07`だけを自動anchorと推定しない。
5. **今回追加/変更するfragmentリンクは明示anchorへ向ける。** 未変更のheading参照をcheckerで解釈できない場合はmanual確認として対象・判定を記録し、fileがあるだけでfragmentもpassとしない。checkerの対象file一覧と抽出件数を保存する。
6. 最小のchecker自己確認は、file有り/fragment無しを検出、明示anchor有りを成功、重複idを検出する3入力。既存文書を書き換えて壊れた例を作らず、workplace内の短い一時文書で確認する。

完了: file欠落0、変更fragment欠落0、anchor重複0。未解釈リンクは件数とmanual結果を明示し、「全リンク切れ0」の範囲を正しく説明できる。

<a id="r2f-06"></a>

## R2F-06 — 最終Java確認と結果保存

前提: Java test編集が終わりR2F-02 focusedが成功。Node/Java production、vendor、parity harnessは計画内で変更していない。

1. Java cwdで次を一度実行し、console log、各段階のexit/件数をR2F-06へ保存する。

```sh
sh scripts/test-all.sh
```

2. importer→全Maven→専用snapshot verifierまで到達したか確認する。skipをpassへ数えず、test追加後の件数をlogから取得する。失敗したら対象原因だけ修正し、必要な確認を再実行する。
3. RPF-08のNode20 parity 9/9は**過去runの証拠**として再利用する。この作業列でproduction/parity harnessを変えていないことを確認し、過去runのHEAD・toolchain・分かる範囲のsource状態を記す。過去の全file hashが無い場合は同一bytesを証明したと書かず、現在runのpass数へも加算しない。今回はtest/docsだけの変更なのでJ-PARITY全体を理由なく反復しない。R2F-03の追加probeは新しい観測として別記する。
4. production/harness変更が混入していた場合はscopeと既存成功結果の適用可否を見直し、必要時だけJ-PARITYを再実行する。Node productionを変更していない作業へN-FULLを追加しない。

完了: 現在のtest sourceに対するJ-ALLの実測と、再利用したparityのsource/toolchain条件が区別される。

<a id="r2f-07"></a>

## R2F-07 — 指摘別closeoutと最終review

1. 共有記録へ`指摘 | 変更path | 受入確認 | 結果 | 残件`を作る。RV2-1〜5すべてを確認し、未達の指摘があれば該当R2Fを完了にしない。
2. F-J1/F-J2/F-J5、TODO、README、remaining-work、closeout、worklog、Java TODO/remaining-migration-itemsをR2F-06の実測へ合わせる。END-01/02/03の**現在結果**から最新を辿れるようにし、前のrunは日付付き履歴にする。
3. RPFの「完了」表示は今回満たした条件と根拠を追記して再判定する。F-J6は将来実装候補の未着手のまま。F-S5/F-S6、header policy、REM-05、既存Gateの未決定状態は実態どおり記録する。
4. 元75行の集計、REM18、RPF10、R2F8の状態を別々に確認する。機能行はR2F-01で確定した期待集合（計画時はB26追加後91件）を検査し、F-*を加算しない。新件数の現在表示とhistorical 90件を区別する。
5. 旧版のNode `workplace/miku-scm/issue-comments/issue-137-comment-202610222129.md`とJava `workplace/miku-scm/new-issues/issue-new-202610222134.md`を保持する。今回の再確認で本文が変わる場合だけ、同じdirectoryへ新JST timestamp版を作る。Node側`workplace/node-java-137/END-03/java-drafts/`のmirrorも更新するなら新版名で保存し、Java側原本との一致を確認する。
6. #137新版をdraftする場合は、その時点のmiku-scm指示を読み、下記の固定readerで現行本文/commentsを取得してから作る。取得不能でもローカル修正を戻さず、草案更新のみ未実施と記録する。必要な草案更新が未実施ならR2F-07は部分完了とし、計画全件完了と書かない。GitHubへ投稿しない。

```sh
node /Users/igapyon/.codex/skills/igapyon-miku-scm/scripts/miku-scm-run.mjs --format json writing.issue.prepare --repo /Users/igapyon/Documents/git/miku-project --github-repo igapyon/miku-project --issue 137
```

7. 両repoで`git diff --check`、`git status -sb`、最終diffを確認する。未追跡の計画/比較/記録文書は内容と末尾空白も検査する。Java test以外のproduction/version/vendor追加差分が無いことをbaselineと比較する。
8. 文書編集完了後にR2F-05のfile/fragment/duplicate-anchor検査を再実行する。草案・ログ等のignoredリンクも、管理文書のリンクから実在するか確認する。

完了: 5指摘の解消根拠、現在の成功/失敗/skip、実行していない将来実装、未決定事項、現在の草案pathが一つの共有記録から辿れる。

## 将来Lunaへ渡す開始文

> `docs/node-java-work-plan-v20261022/self-review-followup-plan.md`を読み、R2F-00〜07を依存順に実行する。既存dirty変更を保持し、各カードの受入確認を記録する。B26/F-J6は独立した将来実装候補として追跡し、今回の修正列でupdate_task本体や未決定policyを実装しない。現在件数・履歴・fragmentの検証を完了してから完了判定する。

**上記は後日の開始文の保存例である。初版作成時は計画のみだったが、2026-10-22に明示許可を得てR2F-00〜07を実行し完了した。**
