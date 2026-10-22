# 基準確認とlegacyの作業カード

[共通手順・確認コマンド](README.md)を読み、実行指示を受けたカードだけを扱う。各カードの最新状態は[作業索引](task-index.md)を参照する。新規test class / helper名は以下の名前で作成予定とし、実装前には存在するものとして扱わない。

<a id="pre-01"></a>

### PRE-01 比較基準と作業ツリーを記録する

- 依存: なし
- 対象: 両版。比較表の基準、全行。
- 入力・範囲: 両repoの`git status -sb`、HEAD、比較表冒頭、Node package/lockfile、Java POM、対象source。
- 手順: HEADとdirty fileを記録。比較表の固定commitから機能sourceが変わった場合は該当diffだけを読み、影響行を列挙する。metadata/docsだけの変化ならその事実を記録して続ける。既存の未commit変更を保持する。
- 完了: 作業時baseline、既存変更、再評価が必要な行、以後使用するsource identityが一枚の記録にある。
- 確認: DOC。sourceが変わり旧判断を流用できない場合は当該カードを保留し、基準更新が必要と記録する。

<a id="pre-02"></a>

### PRE-02 legacy比較fixtureと実行結果の器を用意する

- 依存: PRE-01
- 対象: Java中心、Nodeをlegacy比較に使う。C01-C22、B07-B21。
- 入力・範囲: `cli/MikuprojectNodeParityTest.java`、`cli/MikuprojectCliTest.java`、Nodeのworkbook diff / CLI review tests。新規予定`cli/NodeJavaLegacyCases.java`、`src/test/resources/node-java-137/`。
- 手順: READMEのBASE/STATE/PATCH_OK/UNKNOWNを用意。JavaとNodeのexit/stdout/stderr/artifact bytesを別に取得するtest helperを既存helperに沿って作る。stdinは固定bytesを与えてEOFを保証し、Node subprocessには10秒上限を付ける。JavaでSystem.inを置換するときはfinallyで復元し、このtestを並列化しない。
- 完了: 同一正常caseを二度実行して同じ観測を得る。Nodeの既存legacy互換期待値とJava既存testを基準として記録する。既存失敗はそのまま保存してbaseline取得を完了できるが、影響する後続修正は原因が分かるまで保留とする。凍結metadata等の既知例外を消す正規化を入れない。
- 確認: J-FOCUS `MikuprojectCliTest`、既存J-PARITY。既存失敗は変更前baselineとして記録し、無関係な修正を混ぜない。test helper追加だけで全caseの同等性を宣言しない。

<a id="leg-n01"></a>

### LEG-N01 許可済みのout optionをNode helpへ掲載する

- 依存: PRE-01
- 対象: Node。F-N1、B04、C01/C02/C07/C10。
- 入力・範囲: `scripts/lib/cli-presentation.mjs`、`cli-command-specs.mjs`、既存`tests/mikuproject-cli-review-regressions.test.js`。
- 手順: `ai spec / ai detect-kind / ai validate-patch / state diff`の四usage行へ既存の`--out`を追記。各commandとoptionがhelpに現れる回帰を既存fileへ追加する。
- 完了: option registryや実行結果を変えず、四usage行だけを同期。B13のmetadataは変更しない。
- 確認: N-FOCUS `tests/mikuproject-cli-compatibility-contract.test.js tests/mikuproject-cli-review-regressions.test.js`。作業列完了時のN-FULLはEND-02。

<a id="leg-j01"></a>

### LEG-J01 workbook diffのscalar比較を固定する

- 依存: PRE-02
- 対象: Java。F-J1、C10、B20、D04/D05。
- 入力・範囲: `projectworkbookjson/ProjectWorkbookJsonDiff.java`、新規予定`projectworkbookjson/ProjectWorkbookJsonDiffTest.java`、Node `mikuproject-workbook-diff.test.js`。
- 手順: BASEをdeep copyし、Project Name、非merge列、欠落/null、空文字、0、false、数値/文字列の違いを一条件ずつ検査。expected changeはcaseにliteralで記述する。差が出た比較処理だけを修正する。
- 完了: 共通既知列の差を落とさず、欠落とnullのみ同値。入力変更なし。Java拡張列は比較対象へ追加しない。
- 確認: J-FOCUS `ProjectWorkbookJsonDiffTest,ProjectWorkbookJsonTest`。

<a id="leg-j02"></a>

### LEG-J02 diffのrow構造とtask順を固定する

- 依存: LEG-J01
- 対象: Java。C10、B20。
- 入力・範囲: LEG-J01のsource/test。
- 手順: Tasks/Resources/Assignments/Calendars/NonWorkingDaysを各々一行追加・削除。Tasksの既存二行の交換と、先頭一行挿入を別caseにする。ProjectはField keyで扱う。NonWorkingDaysはCalendarUID/Index tupleを使う。
- 完了: row-added/row-removed、before/after position、row_key、scopeを期待どおり返す。単なる挿入で生存taskすべてを移動扱いしない。Tasks以外の行順は差にしない。
- 確認: J-FOCUS `ProjectWorkbookJsonDiffTest`。

<a id="leg-j03"></a>

### LEG-J03 diffの不完全性と不正入力を固定する

- 依存: LEG-J02
- 対象: Java。C10、B20、D03/D04。
- 入力・範囲: 同diff source/test、Nodeのunknown/placeholder/identity case。
- 手順: unknown sheet、unknown列、unknown Project Field、意味のある行のkey欠落・重複、非scalar、完全な空placeholderを個別caseにする。before/after別warning、入力の実行前後deep equalityもassertする。
- 完了: unknownでcomparison_complete=false。既知差0でも完全noopと誤認しない。不正identity/非scalarは拒否。空placeholderだけは空集合扱い。
- 確認: J-FOCUS `ProjectWorkbookJsonDiffTest,ProjectWorkbookJsonTest`。

<a id="leg-j04"></a>

### LEG-J04 workbook warningをcommand診断まで追跡する

- 依存: PRE-02
- 対象: Java。F-J1、B18/B19、C03-C06/C09/C11-C22。
- 入力・範囲: `cli/MikuprojectCli.java`、新規予定`cli/MikuprojectCliRegressionTest.java`、Nodeのwarning回帰。
- 手順: UNKNOWNでprojection、summary、export xml、report wbs-markdownをtext/json各形式で確認。PATCH_OKとunknown operationのpatchを別に使い、validate/applyのbase warningとpatch warningの合算も確認する。
- 完了: 非fatal warningはexit 0、件数と内容が失われない。通常のwarningなしprimary outputは維持。凍結metadataのB13はassert対象から勝手に変えない。
- 確認: J-FOCUS `MikuprojectCliRegressionTest,MikuprojectCliTest`。

<a id="leg-j05"></a>

### LEG-J05 出力失敗時の成功診断を抑える

- 依存: PRE-02
- 対象: Java。F-J1、B16/B19。
- 入力・範囲: `cli/MikuprojectCli.java`、同RegressionTest。
- 手順: textとbinaryを一commandずつ選び、出力先に既存directoryを指定する。親directory自動作成の是非をこのcaseへ混ぜない。stdout、stderr JSON数、exit、既存入力bytesを検査し、必要なら成功診断の順序だけを直す。
- 完了: exit 1、primary stdout空、error診断一件、success診断なし、入力不変。正常出力のoverwrite契約は維持。
- 確認: J-FOCUS `MikuprojectCliRegressionTest`。親不存在caseはDEC-02後にAPPLY-02で扱う。

<a id="leg-j06"></a>

### LEG-J06 option値欠落と余分な位置引数を扱う

- 依存: PRE-02
- 対象: Java。F-J2、B08。
- 入力・範囲: `MikuprojectCli.inspectInvocation / parseOptions / validateInvocationOptions`、RegressionTest、Node argv/registry。
- 手順: `ai spec --out`、`ai spec --out --out <path>`、`ai spec extra`、commandに属さないoption、同じoptionの重複を再現。共有named-option契約と照らし、どのoption出現でも値欠落があれば入力読取前に拒否する。全出現に値がある重複では最後の値採用を残す。
- 完了: 不正入力はexit 2、primary outputなし、input/output未変更。値欠落の後に同optionを繰り返しても成功へ戻らない。Java拡張commandの許可optionは削らない。root/command helpの文法はDEC-01へ送る。
- 確認: J-FOCUS `MikuprojectCliRegressionTest,MikuprojectCliTest`。

<a id="leg-j07"></a>

### LEG-J07 stdinの重複指定を入力前に拒否する

- 依存: LEG-J06
- 対象: Java。F-J2、B09。
- 入力・範囲: CLIのdiff、validate-patch、apply-patch入口、RegressionTest。
- 手順: diff両入力`-`、patchのstate/input両方`-`、state=`-`と暗黙stdinをcase化。read時に失敗するInputStreamを使い、拒否前の読取がないことをassertする。正常なstdin一件も残す。
- 完了: 二重stdinはNodeと同じ用途のusage diagnostic、exit 2、read回数0、生成物なし。helperは共有入力guardの責務に留める。
- 確認: J-FOCUS `MikuprojectCliRegressionTest`。

<a id="leg-j08"></a>

### LEG-J08 max-depthの境界を確認し字句検査を揃える

- 依存: LEG-J06
- 対象: Java。F-J2、B10/C05。
- 入力・範囲: CLI phase-detailのdepth取得、Node `parseOptionalNonNegativeInteger`、RegressionTest。
- 手順: 未指定、0、2、-1、1.5、abc、非常に長い正整数を再現。非負整数という既存契約で決まる字句検査を修正する。Java int上限を超える値とNode Numberの受理差は別に記録する。
- 完了: 確定範囲の不正字句はexit 2。巨大値の上限が既存仕様から決まらなければ、勝手な上限・無制限処理を採用せず、必要な上限判断と観測を決定記録へ追加する。
- 確認: J-FOCUS `MikuprojectCliRegressionTest`。巨大値の未決定を残したまま全範囲互換とは記録しない。

<a id="leg-j09"></a>

### LEG-J09 draftとpatchのfenced JSON入力を確認する

- 依存: PRE-02
- 対象: Java。F-J2、B11/C08/C11。
- 入力・範囲: CLI `parseJsonFile`呼出しのうちAI draft/patch側、`CoreApiAiJson`、RegressionTest。
- 手順: plain JSON、前後説明付きjson fence、二つのfenceを用意。既存extractLastJsonBlockを使う共通AI入力経路へ寄せ、最後のjson blockを使う。workbook JSONやv1入力まで寛容化しない。
- 完了: draft/patchのplain/fencedが同じ意味、workbook/v1の入力契約は不変。変更は対象commandに限定する。
- 確認: J-FOCUS `MikuprojectCliRegressionTest,CoreApiImportTest`。

<a id="leg-j10"></a>

### LEG-J10 kind判定不能を失敗として出力する

- 依存: PRE-02
- 対象: Java。F-J2、B12/C02。
- 入力・範囲: CLI detect-kind、RegressionTest。
- 手順: `{}`と正常PATCH_OKをtext/json診断で実行。判定不能時に空行やsuccess envelopeを先に出さず、共有legacyのprocessing error経路へ送る。
- 完了: 判定不能はexit 1、primary output空、error status/codeを持つ診断。正常kind出力を維持。B13の出力先metadataはここでは変更しない。
- 確認: J-FOCUS `MikuprojectCliRegressionTest`。

<a id="leg-j11"></a>

### LEG-J11 patch validation失敗のreport経路を確認する

- 依存: LEG-J04、LEG-J09
- 対象: Java。F-J2、B14/C07。
- 入力・範囲: CLI ai validate-patch、Node `validatePatchCommand`、RegressionTest。
- 手順: STATEに対するPATCH_OK、kind不正、構造不正patch、構文不正JSON、読込失敗を使う。Node側でprocessing failureとusage failureがどのchannelへ出るか記録し、対応するJava経路を分ける。unknown operationのwarningをerrorへ昇格させない。
- 完了: malformed JSONは`invalid_json_input`を含むprimary validation report / exit 1、読込・patch処理failureもreport / exit 1、usageの診断はexit 2、warning成功はexit 0。base warningはpatch適用failureでも失わない。
- 確認: J-FOCUS `MikuprojectCliRegressionTest,ProjectPatchJsonTest`。message文字列だけを見てerror codeを推測する新処理は足さない。

<a id="leg-j12"></a>

### LEG-J12 binary I/Oの拒否条件とcodeを照合する

- 依存: LEG-J06
- 対象: Java。F-J2、B07/B15。
- 入力・範囲: CLI import xlsx / binary export・report、Node `cli-io.mjs`、RegressionTest。
- 手順: in+in-base64併用、raw `--in -`、out+out-base64併用、out-base64の`-`以外、binary出力先なし、空/不正/padding欠落Base64を各一case。対応するNode error codeとmetadataを記録し、共通契約の拒否経路を揃える。
- 完了: binaryデータを読む前の検査、exit/code/required option情報が対応する。標準decoderの許容差で仕様根拠が不足したcaseは決定記録へ送り、Nodeの暗黙の寛容性まで模倣しない。
- 確認: J-FOCUS `MikuprojectCliRegressionTest,MikuprojectCliTest`。

<a id="leg-j13"></a>

### LEG-J13 UTF-8と改行の環境依存を調べる

- 依存: PRE-02
- 対象: Java。F-J2、B21。
- 入力・範囲: CLI main/PrintStream境界、Java既存parity helper、RegressionTest。
- 手順: 日本語を含むSTATEでstdout/fileのUTF-8 bytesを比べる。既定charsetがUTF-8でないJVM条件を明示したsubprocess caseも作る。データと診断のLF、helpのruntime固有文面差を別に観測する。
- 完了: 必要な共通データ出力のUTF-8契約が明確。確定契約の範囲だけ入口encodingを修正。環境が用意できなかったcaseは未確認として残す。Java 8互換を保つ。
- 確認: J-FOCUS `MikuprojectCliRegressionTest`、J-PARITY。環境profileと実測charsetも記録する。

<a id="leg-j14"></a>

### LEG-J14 AI系7commandの正常導線を比較する

- 依存: PRE-02、LEG-J04、LEG-J09-LEG-J11
- 対象: Javaのparity test。C01-C07。
- 入力・範囲: `MikuprojectNodeParityTest`、NodeJavaLegacyCases、STATE/PATCH_OK。
- 手順: spec、detect-kind、overview、task-edit、phase-detail、bundle、validate-patchを各一正常case。task/phaseは明示UIDとauto、phaseはscoped/fullを別caseにする。output先とdiagnostics指定は共通catalogに記録する。
- 完了: 比較したcaseのexit/stdout/stderr/生成物と例外が記録される。未決定のB13を一致するよう書き換えず、観測差として残す。
- 確認: J-PARITY。未実装・未比較のcommandをskipして全7件passと書かない。

<a id="leg-j15"></a>

### LEG-J15 state系4commandの正常導線を比較する

- 依存: LEG-J01-LEG-J04、LEG-J07、LEG-J09
- 対象: Javaのparity test。C08-C11。
- 入力・範囲: 同parity testとSTATE/PATCH_OK、既存draft例。
- 手順: from-draft→summarize→apply-patch→diffを固定fixtureで実行。変更前/後input bytes、primary JSON、warning、change summaryを比較する。
- 完了: 4commandの対応caseと結果がある。diffとmergeを同じ処理として期待値生成しない。
- 確認: J-PARITY、J-FOCUS `ProjectWorkbookJsonDiffTest,MikuprojectCliRegressionTest`。

<a id="leg-j16"></a>

### LEG-J16 exchange系4commandとcore format/modeを比較する

- 依存: PRE-02、LEG-J12、KEEP-02
- 対象: Javaのparity/既存core tests。C12-C15、D01/D05/D09-D11。
- 入力・範囲: `MikuprojectNodeParityTest`、`CoreApiImportTest`、`CoreApiWorkbookTest`、共通fixture。
- 手順: import xlsx、export workbook-json/xml/xlsxの正常caseと、core importExternalの五format / 許可mode・baseModel必須を対応づける。CSVの既存core入口もmappingへ記録する。
- 完了: JSON共通projection、XMLの比較単位、Java拡張XLSX列を区別。意図した列差を消すbyte比較を要求しない。XML fieldの未解決はDEC-05-DEC-10へ接続。
- 確認: J-PARITY、J-FOCUS `CoreApiImportTest,CoreApiWorkbookTest,ProjectXlsxTest`。

<a id="leg-j17"></a>

### LEG-J17 帳票7commandの既存parityを確認する

- 依存: PRE-02、KEEP-03
- 対象: Javaのreport/parity tests。C16-C22。
- 入力・範囲: `MikuprojectNodeParityTest`、`WbsMarkdownTest / WbsSvgTest / WbsXlsxTest`、dependency/hierarchy fixture。
- 手順: 既存report dir / all / monthly ZIP比較がどのcommand・entryを覆うか列挙。不足するstandalone report経路だけcaseを補う。entry名、非空、同一fixtureのbytesを確認する。
- 完了: 七commandへのcoverage対応がある。日付なしfallbackとJava帳票optionの未決定を共通dated parityへ混ぜない。
- 確認: J-PARITY、J-FOCUS `WbsMarkdownTest,WbsSvgTest,WbsXlsxTest,MikuprojectCliTest`。

<a id="keep-01"></a>

### KEEP-01 Java拡張commandと既存入口の維持理由を固定する

- 依存: PRE-01
- 対象: 両版の文書、既存Java testの照合。E01-E07、B01/B02/B05/B06。
- 入力・範囲: Java README / upstream-cli-mapping / CLI test、Node registry。
- 手順: 七拡張commandに用途・Node core対応の有無を付ける。help alias、version alias、重複option、削除済みflat/batch commandのtestを参照する。
- 完了: 「維持」「非採用を維持」が各行で追跡できる。Nodeへcommandを追加するtaskは作らない。source変更なし。
- 確認: DOC。実装列を併せて実行している場合のみ既存J-FOCUS `MikuprojectCliTest`の結果を引用する。

<a id="keep-02"></a>

### KEEP-02 Java native列と共通projectionの境界を固定する

- 依存: PRE-01
- 対象: 両版のschema / facade / docs。D01-D05/D09-D11、C13/C15。
- 入力・範囲: Node workbook schema、Java ProjectWorkbookSchema / CoreApiWorkbook / CLI projection / diff。
- 手順: Tasks 5、Resources 7、Assignments 10の追加列を列名で再確認。native API、CLI workbook JSON、XLSX、diffの四つにどの列集合が使われるか対応表を作る。
- 完了: 共通projectionとJava native保持の差を説明できる。core能力があるがCLI入口がないケースも記録する。列の追加・削除はしない。
- 確認: DOC。必要な意味検証はLEG-J01-LEG-J03 / LEG-J16へ接続。

<a id="keep-03"></a>

### KEEP-03 日付なしSVGとdated parityの差を記録する

- 依存: PRE-01
- 対象: Java/Node SVG sourceと追跡文書。C17/C18、D06。
- 入力・範囲: Node wbs-svg-render、Java WbsSvg*、upstream-cli-mapping、既存SVG/parity test。
- 手順: dated fixtureは共通bytes、日付なしfixtureはNode label-only / Java fallbackという既存判断を対応付ける。どのtestが各条件を覆うか記録する。
- 完了: 二種類の期待結果が混ざらない。fallbackを削除したりNodeへ足したりしない。
- 確認: DOC。実行確認を含む指示ならJ-FOCUS `WbsSvgTest`を使い、case不足だけLEG-J17へ渡す。

<a id="keep-04"></a>

### KEEP-04 zero-duration warningの採用範囲を記録する

- 依存: PRE-01
- 対象: Java validator/docs。D07。
- 入力・範囲: MsProjectValidate、Java TODO/runtime-java-cli、既存MsProjectXmlTest。
- 手順: placeholder/summary/milestone除外、複数task、同一日時という条件と、validationに載せimport warningへ混ぜない既存判断を列挙する。
- 完了: Java固有warningの理由と出口が明確。Nodeへの同warning追加を要件化しない。
- 確認: DOC。実行確認を含む指示なら既存J-FOCUS `MsProjectXmlTest`を使う。

<a id="keep-05"></a>

### KEEP-05 runtime境界と将来要求を既存範囲に留める

- 依存: PRE-01
- 対象: 両版docs。R01-R08、V13-V16、D12。
- 入力・範囲: 両README、Node browser-runtime / G4 matrix、Java runtime docs、比較表。
- 手順: MJS/JAR、browser/Web、公開名/Java package、legacy/v1 manifest、internal candidate/public assetを一枚に整理。v1のdefer項目と別Issue #135は参照だけを残す。
- 完了: 配布・言語差と未対応機能を区別。歴史matrixは当時の状態を保持。version更新、Web/MCP/Skills実装、#135の工数列追加は実行範囲へ含めない。
- 確認: DOC。
