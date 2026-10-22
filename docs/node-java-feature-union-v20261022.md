# Node / Java 機能・差分判断表 — 2026-10-22

対象: [miku-project #137](https://github.com/igapyon/miku-project/issues/137)

この表は、Node版とJava版に現れる機能・振る舞いの和集合を比較対象にし、各差分の判断と次の対応を記録する。共通仕様へ揃える項目、理由を付けて差を残す項目、仕様判断を保留する項目をすべて成果物に含める。実装の追加・削除・変更は、この表から導く後続作業である。

具体的な作業手順・依存・判断待ち・完了条件は[Luna用作業分解](node-java-work-plan-v20261022/README.md)を参照する。比較表の固定revisionはLEG調査のhistorical baseline、現在の変更と今回の再確認は[共有確認結果](node-java-137-review-evidence-v20261022.md)およびworklogに記録する。未commit worktreeの状態をfixed commit内のsource evidenceとして扱わない。

## 比較基準と読み方

| 対象 | 固定した基準 | 作業ツリー・配布物との関係 |
| --- | --- | --- |
| Node | 9a9f562c03d28f1b0f3c809226dc61d0cd9d5f7e, v1.1.1相当の固定調査baseline | 調査時branch devel-tiga1021ubc。Node 1.1.2 package/lockfile changesは別作業。今回RPF時点のdirty code pathsはbaseline tableとshared review evidenceに記録し、fixed commitには含まれない |
| Java | `aca9809a94b6e15915729c90f1a57a04e66c85de`、RPF-00で捕捉したcommit済みPOM 1.1.1の固定調査baseline | RPF-09時点のbranch `devel-tiga1022a` / current HEAD `c0b44214c8bc5ccd8722fd47f7ae98562b6e1643` (`Java版の機能差分を検証しv1.1.2へ更新`, 2026-10-22 21:21 JST) はRPF-00後の状態遷移で、既存dirty implementation/version workをcommitしたもの。比較表のhistorical fixed baselineを置き換えない。current worktreeには未commit `ProjectXlsxTest.java` RPF-03 changesと今回Java TODO/status updatesが残る。 |
| Javaのlegacy参照 | vendored Node `v1.1.1`、`9a9f562c03d28f1b0f3c809226dc61d0cd9d5f7e` | historical portの追跡材料。共有legacy CLIの互換方針は[J-map]に明記されている |
| Javaのv1参照 | `vendor/miku-project-contract/v1.0.3/`、Node source `693b4ecd7d4328d77f3b2eada9c4965a9c9b15f5` | immutable contract / Schema / fixture / goldenの正本。moving subtreeと分離する |
| Nodeのv1 actual candidate | Gate G4承認済み`v1.0.3`、[外側lock](miku-project-node-reference-runtime-lock-v1.0.3.json) | 内部reference。通常のlegacy CLI bundle、browser runtime、公開Release用workflowと区別する |

調査範囲は、公開CLIの全command・許可option、入出力と失敗時の振る舞い、READMEに公開されたcore入口、交換形式・帳票、v1の共通契約と配布境界である。Web UIは別repositoryの責務として記録する。非公開helperやMS Project XMLの全タグについての完全同等性は、この表の確認結果に含めない。

「実装あり」はソースに経路があることを意味する。初期の静的棚卸しの後、LEG cardsで対象test/Node-Java比較が追加された。RPF-06/07の90 stable IDsはhistorical auditであり、R2F-01追加のB26を含む現在のfeature unionは91行。test成功は当該caseの根拠であり、両runtime全体の適合証明ではない。

| 判断 | 意味 |
| --- | --- |
| 共通維持 | 両版に対応入口・共通方針がある。確認済みの差がなければ現状を維持する。全入力での同一出力を意味しない |
| 実装検討 | 共通契約の未完了、または仕様・既存の意図と実装の不整合がある。対応先、再現確認、受入条件を後続項目に記録する |
| 差異維持 | runtime境界、明示されたextension、互換性維持または承認済みscopeを根拠として差を残す |
| 仕様判断 | 意図を決める根拠が不足する、または文書・実装が衝突する。判断案と必要な証拠を記録し、仕様変更を先行させない |

新しい仕様判断と後続項目は調査結果・提案であり、Gate承認やGitHub Issue作成の実施記録ではない。既存のlegacy互換方針を確認材料に使い、v1の意味は共通contract / corpusから判断する。NodeまたはJavaの全実装を一律の正として採用しない。

## 1. legacy CLIの和集合

`T`は`--in / --out / --diagnostics text|json`、`B`は`T + --out-base64 -`を表す。`ai spec`以外のtext入力は、個別の必須入力指定を除き`--in`省略または`-`でstdinを使用する。text出力は`--out`省略または`-`でstdout。binary出力はfileまたは明示Base64経路を使用する。共通の入出力上の差は第3節に記録する。

定義を静的に抽出して照合した結果、Nodeのlegacy commandは22件、Javaは29件である。共有22件の許可option名の集合はすべて一致し、Javaだけのcommandは下表のE01〜E07である。optionの値・既定値・失敗経路の一致は、この集合比較からは結論しない。

| ID | command / 許可option | Nodeの状態・出力 | Javaの状態・出力 | 判断と理由 | 次の対応・根拠 |
| --- | --- | --- | --- | --- | --- |
| C01 | `ai spec` / `--out` | AI JSON spec Markdown | JAR/classpathへ内包した同spec | 共通維持。spec取得という機能を共有する | helpの表示漏れはB04。空白・末尾改行を含む全byte一致は未確認。[N-entry] [N-ai] [J-cli] [J-ai] |
| C02 | `ai detect-kind` / T | kind名をtext出力 | 同じ入口 | 共通維持。種別判定を共有する | 判定不能・出力先metadataはB12/B13。[N-ai] [J-cli] |
| C03 | `ai export project-overview` / T | `project_overview_view` | 同じ入口 | 共通維持。全体概要のProjection | J14で代表fixtureのJSON値は同じ、`duration_hours`の数値表記が`24` / `24.0`と異なる(B22)。warning・失敗系はF-J1/F-J2。[N-ai] [J-cli] [J-cli-test] [J14-result] |
| C04 | `ai export task-edit` / T、`--task-uid / --select` | `task_edit_view` | 同じ入口 | 共通維持。`auto`既定、UID明示優先、最初の非summary taskを選択可能 | J14で`notes`省略/空文字、`calendar_uid` null/空文字を確認。表現の共通規則はB23/F-S5。`--select uid`の境界はF-J1で照合。[N-util] [J-cli] [J-cli-test] [J14-result] |
| C05 | `ai export phase-detail` / T、`--phase-uid / --select / --mode / --root-task-uid / --max-depth` | `phase_detail_view` | 同じ入口 | 共通維持。`auto`、`scoped`が既定。`full`と局所scopeを共有する | J14で`planned_duration_hours`の数値表記`8` / `8.0`等を確認(B22)。depthの値検査はB10。[N-ai] [N-util] [J-cli] [J-cli-test] [J14-result] |
| C06 | `ai export bundle` / T | overview、full phase / task viewのbundle | 同じ入口 | 共通維持。既存parity testが代表fixtureを比較する | J14で内部viewにB22/B23の差を確認。既存testを全Projectionの同等性へ拡大解釈しない。[N-ai] [J-cli] [J-parity-test] [J14-result] |
| C07 | `ai validate-patch` / T、必須`--state` | dry-run applyによるvalidation report、失敗時exit 1 | processing failureはprimary validation reportへ出す。usage failureはstderrへ出す | 共通維持。validation目的を共有しusage / processing failure経路を区別 | 不正JSONは`invalid_json_input`、入力読込失敗もprimary report。構造失敗時はbase warningを保持し、unknown operationは成功warning。usage failureはreport artifactにしない。patch operation dispatch差はB26/F-J6。[N-ai] [J-cli] [J11-result] [review-evidence] |
| C08 | `state from-draft` / `--in / --out` | draftからworkbook JSON | 同じ入口 | 共通維持。新規draftの取込 | J15のdraft fixtureではprimary JSON bytesが一致。fenced JSON受理の差はB11。[N-state] [J-cli] [J-cli-test] [J15-result] |
| C09 | `state summarize` / T | `state_summary` | 同じ入口 | 共通維持。既存parity testの対象 | J15で同じdate-only stateのproject start/finishとmilestone dateをJavaは09:00/18:00日時へ変換した(B24)。warningを持つ入力もF-J1へ追加。[N-state] [J-cli] [J-parity-test] [J15-result] |
| C10 | `state diff` / 必須`--before / --after`、`--out / --diagnostics` | workbook既知全列、構造変更、task順、比較完全性 | 同目的の実装と専用回帰testあり | 共通維持。merge編集可能列だけに比較を限定しない | LEG-J01〜05 / ProjectWorkbookJsonDiffTestでscalar、row追加削除、順序、unknown / blank / invalid identity、warning、入力不変性を確認。J15はPATCH_OK前後でprimary JSON / diagnosticsのbyte一致を確認。[N-state] [N-diff-test] [J-diff] [J-log] [J15-result] [review-evidence] |
| C11 | `state apply-patch` / T、必須`--state` | 変更後workbook JSON | 同じ入口 | 共通維持。legacy patch operationを適用する | J15でJavaがdate-onlyを09:00/18:00へ変換し、Nodeのnullを空文字に変えるcaseを確認(B24)。複数stdin、warning、失敗reportをF-J1/F-J2で確認。`update_task` dispatchはB26/F-J6で追跡。[N-state] [J-cli] [J15-result] |
| C12 | `import xlsx` / T、`--in-base64` | 構造workbookからworkbook JSON | Tasks / Resources / Assignmentsはexact header label mapping、native extended columnsも認識 | 共通維持。fileまたはBase64入力 | LEG-J16のNotes/CalendarUID mis-mapをF-J5で修正済み。RPF-02/03 public testsは列移動・欠落・unknown・duplicate・identity・short rowを検査。header warning policyは採択していない。[N-exchange] [J-cli] [J16-result] [review-evidence] |
| C13 | `export workbook-json` / T | workbook JSONの再出力 | Node列へ絞るCLI projection | 共通維持。Java native schema全列の公開とは別の共通面 | J16で日付文字列と空Project cellの差を再現(B24)。Java列を共通JSONへ自動追加しない。[N-exchange] [J-cli] [J-map] [J16-result] |
| C14 | `export xml` / T | workbookからMS Project XML | 同じ入口 | 共通維持。legacy ProjectModelのXML出力 | J16のXML bytesは異なるが、Java parser経由の共通workbook projectionは同じ。全tag/全fieldの適合はD08で未確定。[N-exchange] [J-cli] [J16-result] |
| C15 | `export xlsx` / B | Node構造workbook | Java native拡張列を含むworkbook | 差異維持。Java native extension columnsの既存契約 | J16でJava-only列を確認。native workbook値assertionsを維持し、H01/H03/H04でTask/Resource/Assignment native valuesを検査。common header importer修正はB25/F-J5。旧誤参照F-J3を訂正。[N-schema] [J-schema] [J-map] [J16-result] [review-evidence] |
| C16 | `report wbs-xlsx` / B | 表示用WBS XLSX | 同じ入口 | 共通維持。編集用workbookと役割を分ける | dated fixtureのstandalone出力が同一bytes。Java調整optionの不整合はB17。[N-report] [J-cli] [J-parity-test] [J17-result] |
| C17 | `report daily-svg` / T | 日次SVG | 日次SVG、日付なしfallbackあり | 差異維持。日付なしの差はJava側に明記されている | dated出力はstandaloneで同一bytes。日付なしのJava fallback testはlabel-only Node結果との比較に混ぜず維持。[N-report] [J-map] [J-parity-test] [J17-result] |
| C18 | `report weekly-svg` / T | 週次SVG | 週次SVG、日付なしfallbackあり | 差異維持。C17と同じ理由 | dated出力はstandaloneで同一bytes。fallbackはD06/F-J3参照。[N-report] [J-map] [J-parity-test] [J17-result] |
| C19 | `report monthly-calendar-svg` / B | 月別SVG ZIP | 同じ入口 | 共通維持。月ごとのSVGをまとめる | 1-month fixtureのZIP entry名・非空・bytesを確認。[N-report] [J-cli] [J-parity-test] [J17-result] |
| C20 | `report all` / B | WBS XLSX/MD、Mermaid、daily/weekly/月別SVG ZIP | 同じ入口 | 共通維持。帳票一式の構成を共有する | 6 entryの名前・非空・bytesを確認。[N-report] [J-cli] [J-parity-test] [J17-result] |
| C21 | `report wbs-markdown` / T | WBS Markdown | 同じ入口 | 共通維持。人向け派生出力 | standalone / report-dir entryが同一bytes。調整optionはB17、工数追加はD12。[N-report] [J-cli] [J-parity-test] [J17-result] |
| C22 | `report mermaid` / T | Mermaid gantt | 同じ入口 | 共通維持。人向け派生出力 | standalone / report-dir entryが同一bytes。[N-report] [J-cli] [J-parity-test] [J17-result] |

| ID | Javaのみのcommand / 許可option | Nodeの状態 | Javaの状態 | 判断と理由 | 次の対応・根拠 |
| --- | --- | --- | --- | --- | --- |
| E01 | `state validate` / 必須`--in` | このlegacy CLI入口なし。core validatorあり | workbook JSON検査 | 差異維持。明記されたJava運用拡張 | Nodeへ同名commandを要求しない。[J-map] [J-cli] [N-core] |
| E02 | `state import` / 必須`--in`、`--out` | 同名入口なし。近い用途に`export workbook-json`、core importあり | workbookをmodelへ取り込み再出力 | 差異維持。Javaの明示的なimport導線 | 出力schemaはD02のCLI projectionに従う。[J-map] [J-cli] |
| E03 | `state merge` / 必須`--state / --in`、`--out` | CLI入口なし。core workbook mergeあり | 限定編集列のmerge | 差異維持。既存Java運用拡張 | Nodeに同じcore能力があることとCLI露出を分けて記録。[N-import] [J-import] [J-cli] |
| E04 | `validate xml` / 必須`--in` | このlegacy CLI入口なし。core XML/model validationあり | XMLからmodelを検査 | 差異維持。Java legacy拡張 | v1 `validate --project`とは別機能として扱う。[J-cli] [J-map] [N-core] |
| E05 | `validate xlsx` / 必須`--in` | このlegacy CLI入口なし。core XLSX importあり | XLSX由来modelを検査 | 差異維持。Java legacy拡張 | v1のXLSX対応を意味しない。[J-cli] [J-map] |
| E06 | `merge xlsx` / 必須`--state / --in`、`--out` | CLI入口なし。core XLSX mergeあり | XLSXを既存modelへ限定merge | 差異維持。既存Java運用拡張 | Node coreの同能力もD01に含める。[N-import] [J-import] [J-cli] |
| E07 | `report dir` / 必須`--in / --out` | CLI入口なし。report entriesのcore出力あり | 帳票一式をdirectoryへ展開 | 差異維持。ZIPと同じ内容を展開するJava運用拡張 | v1 committed artifact setと同一視しない。[J-cli] [J-cli-test] [J-parity-test] |

## 2. control・呼出し方の差

| ID | 機能・振る舞い | Node | Java | 判断・理由・次の対応 |
| --- | --- | --- | --- | --- |
| B01 | 引数なし、root `--help` | legacy root helpをstdoutへ出しexit 0 | Java extensionsを含むhelp、exit 0 | 共通維持。掲載するruntime固有機能の差は維持。[N-entry] [N-help] [J-cli] [J-cli-test] |
| B02 | `help / -h / version` alias | command registryにない | 先頭引数として受理 | 差異維持。Javaのhelp aliasは既存testで明示。version aliasも既存入口として残す。Nodeへの追加要件にしない。[N-argv] [J-cli] [J-cli-test] |
| B03 | `<legacy-command> --help`とoption位置 | Nodeはhelpをcontrolとしてroot表示。optionをcommand前にも解析できる | help判定は先頭のみ。command後の`--help`は許可リスト外。commandを先頭に要求 | 仕様判断。legacy共通grammarとして必要なhelp位置・option順は未固定。案は共通のroot `--help`を維持し、command help改善を独立に設計する。必要証拠は利用例・既存consumer依存。F-S1。[N-entry] [N-argv] [J-cli] |
| B04 | legacy helpの`--out`表示 | C01/C02/C07/C10で許可するがusage行に掲載なし | 当該4commandで掲載 | 実装検討、Node F-N1。parserとhelpの不整合を直す。機能追加は不要。[N-registry] [N-help] [J-cli] |
| B05 | 旧flat / batch command | registryにない | `validate-xml / export-ai-json-spec / export-xlsx / export-wbs-xlsx / export-report-bundle / export-xlsx-batch`等を拒否するtestあり | 共通維持。Javaでの明示的な非採用・削除の証拠があるため欠落機能として復活させない。[N-registry] [J-cli-test] |
| B06 | 同名optionの重複 | 最後の値を採用 | Mapへの上書きで最後の値 | 共通維持。既存legacy grammar。厳格なv1 grammarへ持ち込まない。[N-argv] [J-cli] |

## 3. 入出力・診断・境界値の差

下表の「ソース上の差」は未実行の観察である。F-J1/F-J2では、固定fixtureで再現したうえで、互換契約・利用目的・履歴と照合する。例外として維持する根拠が見つかれば、この表の判断を更新する。

| ID | 機能・振る舞い | Node | Java | 判断・理由・次の対応 |
| --- | --- | --- | --- | --- |
| B07 | text / binary標準経路 | UTF-8 text、stdin/stdout。binaryはfile/Base64 | 同じ基本経路。Node由来binary preflight casesでJava code, details, I/O metadataを照合済み | 共通維持。raw binary stdoutをCLIで要求しない | LEG-J12はNode 20の8 boundary casesを照合。RPF-08 J-ALL 229 tests and Node 20 parity 9/9 pass; this does not cover every binary lexeme. [N-io] [J-cli] [J-cli-test] [J12-result] [review-evidence] |
| B08 | text optionの値欠落・余分な位置引数 | 値欠落をusage error。余分な位置引数はcommand名に残り拒否 | いずれかのoption出現で値が欠けるとusage error。余分な位置引数も拒否 | F-J2の自己レビューで`ai spec --out --out <path>`を追加し、後続の値で欠落を解消できないことを確認。全出現に値がある重複は最後の値を使う。[N-argv] [N-registry] [J-cli] [J-map] [J06-result] |
| B09 | 複数入力でstdinを重複指定 | `ensureSingleStdinSource`でdomain入力前に拒否 | diff / validate-patch / apply-patchへshared stdin-source guardを実装。重複sourceをread前に拒否 | 共通維持。1 sourceのみの暗黙stdinは維持 | LEG-J07の三 duplicate-source casesとnormal single-source caseで回帰確認済み。guard無しという記述は旧baseline履歴。[N-state] [N-ai] [N-io] [J-cli] [J07-result] |
| B10 | `--max-depth`の値 | CLI整数0〜100。省略は無制限 | CLI整数0〜100。省略は無制限 | 共通維持。選択rootからのtask descendant depth。101以上と不正字句はusage error。MCP `maxDepth`も0〜100。直接core APIは今回の制限外。[N-util] [J-cli] [J08-result] [I137-result] |
| B11 | AI JSON fenced block | `ai detect-kind / state from-draft / patch`でAI JSON extractorを使用 | detect-kind / draft / patch CLIは既存AI JSON extractor経由。workbook JSON importはplain JSON | 共通維持。AI向け入力経路とstrict workbook JSON入力を区別 | LEG-J09のplain / fenced / multiple-fenced inputsで確認済み。旧plain parser直通はbaseline description。[N-ai] [N-state] [J-cli] [J-ai] [J09-result] |
| B12 | kind判定不能JSON | primary outputを作らずprocessing error、exit 1 | 空lineをprimary outputにせずtext/JSONともerror path、exit 1。JSON codeは`document_kind_not_detected` | 共通維持。no primary artifact on indeterminate kind | `{}`とPATCH_OKをtext/JSONで確認。failure時stdout空、`--out` fileなし。old blank-line outcomeは履歴。[N-ai] [J-cli] [J-ai] [J10-result] |
| B13 | detect-kind / validate-patchの`--out`とI/O metadata | primary outputは指定先へ書く一方、diagnostics構築で`output: null`を使用。detect-kindはこの挙動を互換testで明示的に固定 | `buildIoDiagnostics`が`--out`を参照 | DEC-04でconsumer範囲を確認。MCPはfile outputを要求せずmetadataをparseしない。Skill例もstdout。推奨案はNodeの凍結挙動を維持し、Javaは実際の出力先を報告する例外を文書化。採用はG-META未決定。[N-ai] [N-compat-test] [N-review] [J-cli] [J14-result] [DEC-04-result] |
| B14 | patch validation失敗report | processing failureをvalidation reportへ変換しprimary outputへ出す。usage failureは外側handler | kind・構造・JSON parse・入力読込のprocessing failureをprimary reportへ出す。usage failureはstderr | 共通維持。processing reportとusage errorを区別 | malformed JSON/read failureのreport path確認。構造失敗時のbase warning保持、unknown operationの成功warningを維持。[N-ai] [J-cli] [J11-result] |
| B15 | unknown option / binary option conflict diagnostics | `unknown_option`等。入力競合は`multiple_input_sources`、raw stdinは`binary_stdin_requires_base64`、Base64 errorは`invalid_base64_input` | binary preflightはindividual codes/details: `multiple_input_sources`, `binary_stdin_requires_base64`, `missing_binary_input`, `multiple_output_targets`, `invalid_base64_output_target`, `binary_stdout_not_supported`。malformed/empty/unpadded file Base64は`invalid_base64_input` | 共通維持。code, option/required options, context, I/O source/target modeをNode観測に合わせる | LEG-J12はNode 20の8 casesでchannels/metadataを確認し、invalid Base64をXLSX decoder前に拒否。RPF-01のsix unsupported commandsは別経路。全diagnostics byte equalityは未主張。[N-registry] [N-io] [J-cli] [J-map] [J12-result] [review-evidence] |
| B16 | output親directory、overwrite、成功診断の順序 | 既存fileを直接上書き。親directoryは作らず、書込成功後に成功診断 | text/binary出力で親directoryを作成してから書く。既存fileはoverwriteし、成功診断は出力後の経路 | 仕様判断。DEC-02はNodeのmissing-parent test、Java writer / directory-target testを照合し、repo内consumer例を見つけられなかった。外部依存は未確認のため、現状のruntime差維持を推奨するが未決定。[N-entry] [N-io] [J-cli] [DEC-02-result] |
| B17 | Java帳票調整option | CLIは`--before / --after / --display-mode / --progress-mode / --holiday-dates / --label-mode`を受理しない。core optionsはある | helperと運用文書に当該optionが残るが、現在のreport許可リストにはなく、入口で拒否される | 仕様判断、F-S2。直近の「Java-only optionsを維持」との記録とも衝突する。案は元のJava拡張範囲を履歴から確定し、その範囲だけを復旧する。Nodeへ自動追加しない。[N-registry] [J-cli] [J-runtime] [J-status] [J-log] [J-history] |
| B18 | workbook importのwarning伝播 | projection / summary / export / report / patchへ伝播 | 同目的の実装とwarning regression testsあり | 共通維持。warningsを公開結果へ保持 | LEG-J03/J04でunknown sheet/column/Project field, warning scope, patch combination, text/JSON outputを確認。新規回帰が無いというbaseline記述を更新。[N-review] [J-log] [J03-result] [J04-result] [review-evidence] |
| B19 | JSON diagnosticsと終了code | legacyは主に0/1/2、warningはnon-fatal。error code / metadataあり | 同じ基本分類、structured error report | 共通維持。stable fields/codeはcase-specific | RPF-01は6旧flat commandをtext/JSONで拒否し、JSON stderr objectのcommand/context, `unsupported_command`, error_count 1, warning_count 0, stdout emptyを確認。J14 success artifactのcontext差は別。全diagnostics byte equalityは未主張。[N-diagnostics] [J-cli] [J14-result] [review-evidence] |
| B20 | `state diff`の比較完全性・構造差 | 既知全列、row追加/削除、taskの生存順、null等、未知情報のwarningと`comparison_complete` | 同目的の新実装あり | 共通維持。F-J1でduplicate/missing key、blank placeholder、scalar型、unknown Project field、入力不変性、scope/row keyを確認。[N-diff-test] [N-review] [J-diff] [J-log] |
| B21 | 共通text output charset / newline | Node stdoutはUTF-8、明示LF | `main()`はUTF-8 PrintStream。呼出し側`run(args,out,err)`は渡されたstreamに従う。data/file/diagnostics LFはmacOSで観測、control/help printlnと他OS改行は未確認 | 共通維持。process entrypoint UTF-8とcaller stream/platform boundaryを区別 | LEG-J13はJapanese data/diagnostics/file bytesとISO-8859-1 child JVMを比較。確認範囲は現在macOS/JDK。[N-entry] [N-io] [J-cli] [J-parity-test] [J13-result] |
| B22 | AI projectionのJSON数値表記 | 観測した整数時間値を`24` / `8`として出力 | 同じJSON数値を`24.0` / `8.0`として出力 | 差異維持。J14ではparse後の数値が同値。JSON byte一致の要求は確認できず、runtime serializerの字句差として扱う。[N-ai] [J-cli] [J14-result] |
| B23 | AI projection optional task field shape | 未設定`notes`を省略、`calendar_uid`をnull出力 | `notes` / `calendar_uid`を空文字出力 | 仕様判断、F-S5。projection unset representationは未決定 | Patch input is separate: Node spec empty string=clear、omitted=unchanged、null=type warning。R2F-03のJava未対応はbaseline観測。I137でJava `update_task`を部分実装したが、projection形は変更していない。F-J6の残件はB26。[N-ai] [J-cli] [J14-result] [review-evidence] [I137-result] |
| B24 | shared state / exchange date precision, datetime lexical form, blank cell | LEG-J15 fixtureではstate summarize/applyでdate-only保持。LEG-J16 fixtureでspace datetime / null cell | J15 fixtureでTask / Project datesを09:00/18:00 local datetime化するcase。J16では同値datetimeを`T`区切りで出力し、一部null Project/Calendar cellsをempty string化 | 仕様判断、F-S6。input precision, entity field, task type, routeを分ける | AI specの09:00/18:00補完はdraft-generation contextのnormal task例。Summary/milestone datesは許容されるがmilestone補完除外、summaryの一律defaultなし。Project fields / existing workbook importへ拡張しない。fixture-scoped; inputs unchanged。[N-state] [N-exchange] [J-cli] [J15-result] [J16-result] [review-evidence] |
| B25 | Node XLSX common headerをJava native importerで読む | Tasks/Resources/Assignments shared header set | exact header-name mapping、native Java-only columns保持。unknown ignored、first duplicate wins、zero-known-labelでnative fallback | F-J5 implementation is committed in Java HEAD `c0b4421`; header rules are current behavior, not an adopted shared policy | RPF-03 H01-H09 public regression checks native values, reordered sheets, missing/unknown/duplicate/fallback, UID/short-row. Node duplicate map is last-wins; difference remains explicit.[N-exchange] [J-cli] [J-schema] [J16-result] [review-evidence] |
| B26 | AI JSON `update_task` patch dispatch | Dispatches and updates supported fields | Dispatches and updates 9 fields: `name`, `notes`, `calendar_uid`, `critical`, `is_milestone`, `planned_start`, `planned_finish`, `planned_duration`, `planned_duration_hours`. Progress fields remain unsupported pending Java type decision | I137 adds Java dispatch, strict input handling, warning/change order, milestone coupling, CLI apply/validate and live Node comparison. `percent_complete` / `percent_work_complete` remain pending; Java rejects Node-accepted space datetime and keeps `T` where Node emits a space. F-S6 date policy and F-S5 projection shape remain separate and undecided. F-J6 is **partial**, not complete. [N-patch-spec] [N-patch] [N-patch-updates] [J-patch] [J-patch-updates] [R2F-03-evidence] [I137-result] |

## 4. core・形式・帳票の差

| ID | 機能・振る舞い | Node | Java | 判断・理由・次の対応 |
| --- | --- | --- | --- | --- |
| D01 | `importExternal`のformat / mode | XML replace、XLSX replace/merge、workbook JSON replace/merge、draft replace、patch patch | 同じformat/modeの分岐、merge/patchでbaseModel要求 | 共通維持。CLIへ露出していないcore能力も和集合に含める。[N-import] [J-import] |
| D02 | native workbook JSONとCLI共通projection | Nodeのschema列を公開 | native APIはJava拡張列。共有CLIのJSON出力はNode列へ絞る | 差異維持。APIで保持するデータと共有CLIの交換契約を区別する既存方針。[N-schema] [J-schema] [J-cli] [J-map] |
| D03 | Java native workbook / XLSXの拡張列 | Tasks 17、Resources 14、Assignments 12列 | Tasks 22、Resources 21、Assignments 22列 | 差異維持。追加列の一覧は下表。共通JSONへ一括追加しない。[N-schema] [J-schema] [J-map] |
| D04 | diff対象のschema | Node既知列を比較 | Java diffもNode列を使い、Java native追加列をunknownとしてwarning扱い | 差異維持。共有diffをJava native全列diffへ黙って拡張しない。native編集の比較が必要なら独立した要求とする。[J-diff] [J-map] |
| D05 | workbook / XLSXのmerge | 限定編集列を反映 | 対応するimport/merge APIあり | 共通維持。diffの全列比較とmergeの編集可能範囲を混同しない。個別列のroundtripはF-J1で既存testと照合。[N-schema] [N-import] [J-import] |
| D06 | 日付がないdaily / weekly SVG | 日付位置を得られないtaskをlabelのみで表示する経路 | legacy fallback timelineを保持 | 差異維持。[J-map]で意図的な既存挙動と明示。日付ありfixtureのbyte parityを壊す変更を要求しない。[N-svg] [J-map] |
| D07 | zero-duration task clusterのwarning | 同じ専用cluster検出は見当たらない | model validatorで複数taskの同一日時・zero durationをwarning。import戻り値へは混ぜない | 差異維持。Java TODOとruntime文書で採用経路が決まっている。Nodeへの新warning追加は共通仕様の別判断。[J-gate] [J-runtime] [J-validate] |
| D08 | XML / ProjectModelの保持・正規化 | legacy XML read/write、model normalize/validate | 対応class群あり | DEC-05〜10で全domainの現在モデルfieldは両版が読み書きすると確認。未設定値・数値変換、Task既定値/forward PredecessorUID、Calendar container選択・default calendar edgeに実装差あり。未知tagは両版で保持せず、lossy legacy subsetの仕様判断が必要。Java native workbook追加列とXML mappingは別。G-XML採択前にAPPLY-05を開始しない。[N-core] [J-core] [J-class] [XML-field-inventory] [DEC-05-result] [DEC-06-result] [DEC-07-result] [DEC-08-result] [DEC-09-result] [DEC-10-result] |
| D09 | CSV + ParentID、Mermaid | coreのCSV import/export、report Mermaid | 対応APIあり | 共通維持。CSVのCLI入口を両版へ追加する要件にはしない。方言・escaping境界はfixture依存で確認する。[N-core] [J-core] [N-report] [J-cli] |
| D10 | reusable core APIの入口 | `globalThis.__mikuProjectCoreApi`とbrowser-compatible loader | Javaの`CoreApiPublic / CoreApiRegistry` facade | 差異維持。言語に合わせた入口と型を使用する。意味・format/mode・diagnosticsを比較する。[N-api] [J-api] |
| D11 | patch / AI JSON / reportの再利用API | AI spec / parse / import、workbook/XLSX/patch、report各入口 | 対応facadeと直接classあり。workbook diffは継承APIにも存在 | 共通維持。名前が違うhelperやclass分割を機能欠落と数えない。共有CLIの不整合はB表で追跡。`update_task`はB26/F-J6で部分実装済み。[N-api] [J-api] [J-core] [J-class] [I137-result] |
| D12 | WBSの予定・実績・残工数表示 | 既存の別要求[#135](https://github.com/igapyon/miku-project/issues/135) | schema / runtime固有の保持範囲と、WBSへの表示を別に確認する必要がある | 共通維持。現行契約の範囲を維持し、追加表示の判断は#135で扱う。#135の表示・保持契約が確定した際に比較表を再評価する |

Java native schemaの追加列は次のとおり。これらを保有することと、全ての取込経路で編集・保持が保証されることは別である。

| sheet | NodeにないJava native列 |
| --- | --- |
| Tasks | `Type / Priority / ConstraintType / ConstraintDate / Deadline` |
| Resources | `Cost / ActualCost / RemainingCost / PercentWorkComplete / WorkGroup / StandardRateFormat / OvertimeRateFormat` |
| Assignments | `StartVariance / FinishVariance / Delay / Milestone / WorkContour / Cost / ActualCost / RemainingCost / OvertimeWork / ActualOvertimeWork` |

## 5. 新v1の和集合と意図的な対象外

v1は共有contractに適合する別系列である。legacyの同名・近似機能、Java extension、通常JARの存在をv1の実装完了として数えない。[N-capability]はcore profileの九つのcapabilityと空のruntime extension集合を定義する。

| ID | 能力・契約 | Node | Java | 判断・理由・次の対応 |
| --- | --- | --- | --- | --- |
| V01 | XML subset read・semantic validate | Node reference実装あり | isolated `MikuProjectV1Validate`あり、P5-C1再review/人の承認待ち | 実装検討、Java F-J4。既存sliceのreviewを完了し、その証拠を更新する。[N-v1-matrix] [J-gate] [J-v1] |
| V02 | `inspect --purpose project_overview` | 実装あり | v1 slice未実装 | 実装検討、Java F-J4。P5-C1承認後の既存P5-C2へ対応。[N-v1-cli] [J-map] [N-plan] |
| V03 | `inspect --purpose task_change_context` | leaf taskとancestorを扱う実装あり | v1 slice未実装 | 実装検討、Java F-J4。legacy task-editをそのまま代用しない。[N-v1-matrix] [J-map] |
| V04 | `plan-change set_task_percent_complete` | semantic diff、output plan、human gate bindingあり | 未実装 | 実装検討、Java F-J4。既存P5-C3。runtime binding込みの共通契約から実装する。[N-v1-cli] [N-change] [N-plan] |
| V05 | `apply-change`、XML subset write | approval、pre/post validation、exclusive directory、provenance、commit markerあり | 未実装 | 実装検討、Java F-J4。既存P5-C4。legacy patch / report directoryを代用しない。[N-change] [N-plan] [J-map] |
| V06 | `verify-artifact` | absent/incomplete/committed/corrupt、expected-plan bindingあり | 未実装 | 実装検討、Java F-J4。既存P5-C5。validate serviceはartifact-set入力をまだ扱わない。[N-v1-cli] [J-gate] [N-plan] |
| V07 | v1 runtime launcher / manifest / capability / sources binding | versioned runtimeで自己検証。source/development bundleはworkflowをfail closed | 公開JARへのv1 launcher接続なし。validate serviceはcallerからverified bindingが必要 | 実装検討、Java F-J4。既存P5-E、full profile適合とclean standalone確認まで部分実装を適合済みにしない。[N-v1-matrix] [J-map] [J-gate] |
| V08 | v1 help / version control | root/command help、versionはdomain入力・asset検証なしで取得できる。sourceでのcommand helpもあり | v1 control/launcher未接続 | 実装検討、Java F-J4。新snapshotでcontrol契約を固定してから対応する。[N-v1-cli] [N-v1-help] [J-map] |
| V09 | immutable契約と参照identity | frozen actual candidateはv1.0.3。v1.1.1 exact tagにはunknown-option補正とcontrol help/versionがある | v1.0.3 snapshotを保持。REF-01はv1.1.1 / `9a9f562c03d28f1b0f3c809226dc61d0cd9d5f7e`を次の内部reference候補として提案。CLI contract文書は更新、contract/corpus versionとcorpus digestは不変。G-REFERENCE採択とruntime/lock作成は未実施 | 後続F-X1。採択後に新しい内部runtime lockとversioned Java snapshotを追加。旧v1.0.3とG4 lockを上書きしない。[N-handoff] [J-snapshot] [J-parity-note] [reference-update] |
| V10 | schema / fixture / golden harness | 共通corpusによるNode tests | P5-A/Bのimmutable intake・schema・binding/comparison harness実装、承認済みの記録 | 共通維持。harness完了をcommand適合完了に読み替えない。[N-corpus] [J-gate] [J-snapshot] |
| V11 | semantic / byte comparison | contract指定のcanonical semantics、runtime内のbyte determinism | test-side comparison実装、command側の全面適合は後続 | 差異維持。runtime ID・version・digestやruntime-bound artifact bytesが同一になる要求はない。指定箇所のsemantic equalityを使う。[N-corpus] [N-capability] [J-gate] |
| V12 | v1 result、diagnostic、exit、publication | 共通result / closed code catalog、exit 0/1/2/3、COMMITTED境界あり | validate sliceまで。publication等は未実装 | 実装検討、Java F-J4。legacy diagnosticsの0/1/2をそのまま使わない。[N-v1-result] [N-change] [J-gate] |
| V13 | v1 runtime固有extension | core profileでは空集合 | 同じ空集合を要求 | 差異維持。legacy Java extensionをv1共有surfaceへ移さない。将来採用時は別契約・fixtureを必要とする。[N-capability] |
| V14 | v1のresource/assignment/calendar編集、dependency編集、task構造変更 | defer、C1はleafの進捗一件に限定 | 同じ共有scopeが目標 | 差異維持。承認済みoperation allowlistを広げない。legacy機能の存在はv1追加理由にならない。[N-change] [N-v1-matrix] |
| V15 | v1のXLSX/workbook、actual/baseline/EVM/timephased、追加Projection | defer/unsupported | 同じ共有scopeが目標 | 差異維持。共通format/semantic契約の改訂を別途必要とする。[N-format] [N-v1-matrix] |
| V16 | v1 Web/MCP/Skillsと公開配布 | 後続Gate。Node actual candidateはinternal-reference-only | Java適合/G5が未完 | 差異維持。Gateをまたぐ未完了として追跡し、各adapterのlegacy版の有無と区別。[N-plan] [N-v1-matrix] |

## 6. runtime・配布・互換性の差

| ID | 能力・境界 | Node | Java | 判断・理由・次の対応 |
| --- | --- | --- | --- | --- |
| R01 | 公開実行形式 | Node CLI単一MJSとsources TGZ | Java 8互換fat JAR、sources JAR、distribution ZIP | 差異維持。言語・runtimeに必要な配布形態。[N-package] [N-release] [J-readme] |
| R02 | browser-compatible runtime | importable MJS、Web downstreamがbuild時に内包 | 対象外 | 差異維持。Java CLI移植の不足としない。[N-browser] [J-readme] |
| R03 | Web UI・single-file HTML | `miku-project-web`へ分離済み | 対象外 | 差異維持。main/coreとUIの責務境界。[N-readme] [J-readme] |
| R04 | 公開名と互換identifier | `miku-project`、Node bin alias `mikuproject`、既存wire ID | public artifact名は`miku-project`、`jp.igapyon.mikuproject` / `MikuprojectCli` / 既存wire IDを保持 | 差異維持。公開名移行とJava package/class互換性を分ける。[N-package] [J-readme] |
| R05 | XML / ZIPのruntime依存 | bundled XML DOM等 | JDK / Java側Office ZIP package reader等 | 差異維持。依存の同一化よりも観測できる意味・出力・診断を比較する。[N-package] [J-readme] |
| R06 | release用browser manifestとv1 runtime manifest | browser asset用manifest/checksumがあり、通常Release workflowはv1三memberを生成しない | legacy JAR配布あり。v1 manifest launcherは未完 | 差異維持。別のartifact contractを同一視しない。v1配布はF-X1/F-J4。[N-release] [N-browser] [N-v1-matrix] [J-map] |
| R07 | product versionの一致 | committed 1.1.1、worktree 1.1.2 | committed 1.1.1、POM worktree 1.1.2 | 差異維持。version番号を機能適合の証拠にしない。Java source定数とJAR metadataの整合はversion作業側で確認する。[N-package] [J-cli] |
| R08 | progress表の更新 | G0/G4時点の承認・履歴matrixがある | P5-C1までの進捗を別文書で追跡 | 共通維持。日付付きの履歴を現在の実装状態へ書き換えず、本表と各TODOから現在地へ案内する。[N-v1-matrix] [N-todo] [J-gate] |

## 7. 後続作業・未解決判断

下記はローカルの後続候補である。F-S6の日時精度・時刻補完・datetime表記差は2026-10-23に[GitHub Issue #138](https://github.com/igapyon/miku-project/issues/138)へ記録し、変更を後回しにした。null / empty cellを含むほかの判断候補は引き続きローカルで追跡する。#137の調査表作成と、ここから導く実装修正・Gate G5の完了は別の進捗として追跡する。

| ID / 対応先 | 対象行・対応 | 受入条件・次に必要な証拠 |
| --- | --- | --- |
| F-N1 / Node | B04。legacy helpと許可optionの表示整合 | LEG-N01で`ai spec`、`ai detect-kind`、`ai validate-patch`、`state diff`のhelpに許可済み`--out`を掲載。focused 33 testsとEND-02 Node full build/test（361 tests）が成功。凍結metadataのB13は変更していない。[LEG-N01-result] [END-02-result] |
| F-J1 / Java | C10、B18〜B20。workbook diff / warning / output failureの回帰 | Historical END-02 J-ALL: 224 tests, two PRE-02 baseline CLI failures, 11 opt-in skips. RPF-08's 229 tests preceded R2F-02 assertions. Current R2F-06 passed 229 tests (0 failures/errors, 11 opt-in skips), importer 12/12, snapshot verifier 8/8. Focused and Node 20 J-PARITY 9/9 remain prior runs. [J01-result] [J04-result] [J17-result] [END-02-result] [review-evidence] |
| F-J2 / Java中心、共通判断 | B07〜B12、B14、B15、B19、B21。共有CLIのgrammar・失敗契約 | Historical focused evidence: Node 20 opt-in 34/34; standard Maven intentionally skips Node-dependent test. Current I137 J-ALL passed 238 tests (0 failures/errors, 14 opt-in skips); LEG-J08 selected 0〜100 for Node/Java CLI and MCP; omitted depth remains unlimited. [J06-result] [J08-result] [J11-result] [J13-result] [J14-result] [END-02-result] [review-evidence] [I137-result] |
| F-S1 / 両版の仕様判断 | B03、B16。legacy command helpとoutput親directory | DEC-01はG-HELP、DEC-02はG-PARENTの提案を記録。Nodeのmissing-parent回帰とJavaのparent creation sourceを照合したが、repo内に依存例は見つからず、外部consumerも未確認。親作成方針は未決定。結論前のgrammar/出力方針変更は行わない |
| F-S2 / Javaの仕様判断 | B17。帳票調整optionの文書/許可リスト不整合 | 直近変更`ae71a6a`と直前`fa5f421`のreport dispatchを照合し、各optionが有効だったcommandを確定。案はJava既存extensionとして維持・必要箇所を復旧。意図的削除なら理由・移行を明記。Nodeへの一括追加を要件にしない |
| F-S3 / 両版の仕様判断 | D08。legacy XML/modelのfield・loss境界 | DEC-05〜DEC-09で全5 domainのfield read/writeを棚卸しし、DEC-10で未設定値、default、数値変換、forward-reference validator、unknown XML、calendar edge、artifact byte差を分類した。XML全体のlossless同等性は採用せず、field別のG-XML採択前にAPPLY-05を開始しない。[DEC-10-result] |
| F-S4 / 両版の仕様判断 | B13。互換testで固定された出力先metadata | Nodeの既存互換挙動を維持する。DEC-04はMCP / Skillが`io.output`を消費せず、MCPから対象file outputを指定できないことを確認。推奨はJavaで実際の出力先を維持する例外。G-META採用待ち。[DEC-04-result] |
| F-S5 / 両版の仕様判断候補 | B23。AI projectionの未設定task fieldを省略/null/空文字のどれで表すか | J14で再現した`notes`と`calendar_uid`のshape差に対し、AI JSON specと既知consumerを確認し、共通規則またはruntime例外を提案する。実装変更は採用決定後に別作業へ分解する。F-S5はLEG-J14実行中に発見したため、元の75カードには含まれない |
| F-S6 / 両版の仕様判断候補 | B24。shared state commandでdate-onlyとnull / empty cellをどう保持するか | 日時精度・時刻補完・datetime区切り差はIssue #138へ記録し、変更を延期。現行動作は当面維持し、共通仕様は未採択。null / empty cellと未指定patchの扱いは引き続き未決定。F-S6はLEG-J15実行中に発見したため、元の75カードには含まれない |
| F-J3 / Java | E01〜E07、D02〜D07。維持するextensionの追跡整理 | KEEP-01〜05でJava固有command、native列、report fallback、validation warning、MJS/JAR・browser・legacy/v1境界を根拠付きで整理済み。追加実装は要求しない。[KEEP-results] |
| F-X1 / 両版 | V09、V08、R06。v1の新しい参照identityとsnapshot | REF-01は既存exact tag `v1.1.1` / `9a9f562c03d28f1b0f3c809226dc61d0cd9d5f7e`を候補として記録。G-REFERENCE採択後、contract version 1 / fixture suite 1 / unchanged corpus digestを保持し、更新されたCLI contract memberを含む新しいsnapshotと内部runtime lockを作る。旧v1.0.3とG4 lockは履歴として保持。[reference-update] |
| F-J4 / Java、既存Gate G5 | V01〜V08、V12。v1適合の残件 | P5-C1の再review・人の承認、F-X1を依存として明示。以後inspect→plan→apply→verify、cross-runtime比較、verified JAR/manifest、clean standalone smokeを既存計画に沿って一sliceずつ進める |
| F-J5 / Java | C12、B25。Node XLSXをJavaで読み込む場合のcommon header mapping | Java importはheader名対応、Java native列は保持。Historical focused test 22/22、Node 20 parity 9/9、Maven 225 tests。Implementation/version commit is Java HEAD `c0b4421`. RPF-08 (before R2F-02 assertions): importer 12/12, Maven 229 tests, snapshot verifier 8/8 (0 failures/errors, 11 opt-in skips). Current R2F-06: importer 12/12, Maven 229 tests, snapshot verifier 8/8 (0 failures/errors, 11 opt-in skips). Node 20 parity 9/9 remains historical. F-J5は元の75カード外の追加候補 |
| F-J6 / Java | B26。patch-input `update_task` dispatch and field update | **部分対応（I137）**。9 fieldsとdispatchを実装し、Java focused tests、CLI regression、current Node parityで確認。`percent_complete` / `percent_work_complete`はInteger対小数の方針未決定で未対応。Javaがspace datetimeを受理しない差、T/space output差は回帰に記録し、日時共通化はIssue #138へ延期。F-S5 projection出力の決定とは独立。元の75カード/REM-18の件数に加えない。詳細は[I137結果](node-java-work-plan-v20261022/implementation-plan-v20261023.md)。[R2F-01-evidence] [I137-result] |

[DEC-10-result]: migration-worklog.md
[reference-update]: node-java-137-reference-update.md
[I137-result]: node-java-work-plan-v20261022/implementation-plan-v20261023.md
[LEG-N01-result]: migration-worklog.md
[J01-result]: migration-worklog.md
[J04-result]: migration-worklog.md
[J06-result]: migration-worklog.md
[J08-result]: migration-worklog.md
[J11-result]: migration-worklog.md
[J13-result]: migration-worklog.md
[KEEP-results]: migration-worklog.md
[END-02-result]: migration-worklog.md
[review-evidence]: node-java-137-review-evidence-v20261022.md#rpf-07
[R2F-01-evidence]: node-java-137-review-evidence-v20261022.md#r2f-01
[R2F-03-evidence]: node-java-137-review-evidence-v20261022.md#r2f-03

現在の結論は、共有legacy command名・許可option名の差を埋める追加実装は不要、明示されたJava extensionと配布境界は維持、sourceで見えた共通挙動の不整合は再現・修正候補、v1の不足は既存Gateの未完了として追跡する、である。仕様判断に分類した行には上表の判断案と必要な証拠がある。

## 8. 確認方法と根拠

作業cardの実行結果は追跡対象の[移行worklog](migration-worklog.md)に記録する。`workplace/`内の詳細ログはローカル作業用で、比較表の参照先には使わない。

初期の静的棚卸しで実施した確認:

- 両repositoryのbranch / HEAD / worktreeを確認し、既存のversion変更を識別した。
- Nodeの`LEGACY_COMMAND_OPTIONS`とJavaの`allowedOptions`を静的抽出し、22 shared / 7 Java-only、shared option集合の不一致0件を確認した。
- CLI dispatch、I/O、Projection/draft/patch、workbook schema/diff、core facade、v1 contracts、既存test、変更履歴とtracking docsを読んだ。
- 初期棚卸しの時点では製品test/build、公開Release assetの取得・実行、新しいGitHub Issueの作成は実施していなかった。後続カードで実行した範囲と残る確認は[worklog](migration-worklog.md)に記録する。

抽出対象sourceのSHA-256:

| source | SHA-256 |
| --- | --- |
| Node `scripts/lib/cli-command-specs.mjs` | `a28d95a6c4e24a0bb7fe4ae13e2e2278112c5c583304caa1fbb9cafd99b477f1` |
| Java `src/main/java/jp/igapyon/mikuproject/cli/MikuprojectCli.java` | `61f7eb4487691609f5a1df9539fcf3a4775b9a99e0e6b2c8037d4a447948a0bc` |

Nodeの根拠は本repositoryのrelative link、Javaの根拠は固定commitのGitHub linkとした。過去の比較メモ、G4のmatrix、テスト成功記録はその日付・対象revisionの証拠として扱う。

[N-readme]: ../README.md
[N-package]: ../package.json
[N-entry]: ../scripts/miku-project-cli.mjs
[N-registry]: ../scripts/lib/cli-command-specs.mjs
[N-argv]: ../scripts/lib/cli-argv.mjs
[N-help]: ../scripts/lib/cli-presentation.mjs
[N-io]: ../scripts/lib/cli-io.mjs
[N-diagnostics]: ../scripts/lib/cli-diagnostics.mjs
[N-ai]: ../scripts/lib/cli-ai-commands.mjs
[N-patch]: ../src/ts/project-patch-json-core.ts
[N-patch-updates]: ../src/ts/project-patch-json-updates.ts
[N-patch-spec]: miku-project-ai-json-spec.md
[N-state]: ../scripts/lib/cli-state-commands.mjs
[N-util]: ../scripts/lib/cli-command-utils.mjs
[N-exchange]: ../scripts/lib/cli-exchange-commands.mjs
[N-report]: ../scripts/lib/cli-report-commands.mjs
[N-api]: ../src/ts/core-api-registry.ts
[N-core]: ../src/ts/core-api-msproject.ts
[N-import]: ../src/ts/core-api-external-import.ts
[N-schema]: ../src/ts/project-workbook-schema.ts
[N-svg]: ../src/ts/wbs-svg-render.ts
[N-diff-test]: ../tests/mikuproject-workbook-diff.test.js
[N-compat-test]: ../tests/mikuproject-cli-compatibility-contract.test.js
[N-review]: cli-command-review-fix-plan-v20261021.md
[N-v1-cli]: miku-project-cli-contract-v1.md
[N-v1-help]: ../scripts/lib/v1/cli-v1-presentation.mjs
[N-v1-result]: miku-project-cli-result-contract-v1.md
[N-capability]: miku-project-runtime-capability-contract-v1.md
[N-change]: miku-project-change-contract-v1.md
[N-format]: miku-project-format-and-loss-contract-v1.md
[N-corpus]: miku-project-conformance-corpus-v1.md
[N-plan]: miku-project-zero-base-implementation-plan-v20260810.md
[N-handoff]: miku-project-java-contract-handoff-v1.0.3.md
[N-v1-matrix]: miku-project-v1-capability-matrix-v20260813.md
[N-todo]: TODO.md
[N-browser]: browser-runtime.md
[N-release]: ../.github/workflows/release-runtime-bundles.yml
[J-readme]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/README.md
[J-cli]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/src/main/java/jp/igapyon/mikuproject/cli/MikuprojectCli.java
[J-ai]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/src/main/java/jp/igapyon/mikuproject/coreapi/CoreApiAiJson.java
[J-patch]: https://github.com/igapyon/miku-project-java/blob/c0b44214c8bc5ccd8722fd47f7ae98562b6e1643/src/main/java/jp/igapyon/mikuproject/projectpatchjson/ProjectPatchJsonCore.java
[J-patch-updates]: https://github.com/igapyon/miku-project-java/blob/c0b44214c8bc5ccd8722fd47f7ae98562b6e1643/src/main/java/jp/igapyon/mikuproject/projectpatchjson/ProjectPatchJsonUpdates.java
[J-api]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/src/main/java/jp/igapyon/mikuproject/coreapi/CoreApiRegistry.java
[J-core]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/src/main/java/jp/igapyon/mikuproject/coreapi/CoreApiMsproject.java
[J-import]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/src/main/java/jp/igapyon/mikuproject/coreapi/CoreApiExternalImport.java
[J-schema]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/src/main/java/jp/igapyon/mikuproject/projectworkbookjson/ProjectWorkbookSchema.java
[J-diff]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/src/main/java/jp/igapyon/mikuproject/projectworkbookjson/ProjectWorkbookJsonDiff.java
[J-validate]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/src/main/java/jp/igapyon/mikuproject/msprojectxml/MsProjectValidate.java
[J-v1]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/src/main/java/jp/igapyon/mikuproject/v1/MikuProjectV1Validate.java
[J-cli-test]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/src/test/java/jp/igapyon/mikuproject/cli/MikuprojectCliTest.java
[J-parity-test]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/src/test/java/jp/igapyon/mikuproject/cli/MikuprojectNodeParityTest.java
[J-map]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/docs/upstream-cli-mapping.md
[J-parity-note]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/docs/node-java-feature-parity-v1.1.1.md
[J14-result]: migration-worklog.md
[J15-result]: migration-worklog.md
[J16-result]: migration-worklog.md
[J17-result]: migration-worklog.md
[DEC-02-result]: migration-worklog.md
[DEC-04-result]: migration-worklog.md
[DEC-05-result]: migration-worklog.md
[DEC-06-result]: migration-worklog.md
[DEC-07-result]: migration-worklog.md
[DEC-08-result]: migration-worklog.md
[DEC-09-result]: migration-worklog.md
[XML-field-inventory]: node-java-137-xml-field-inventory.md
[J-status]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/docs/remaining-migration-items.md
[J-class]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/docs/upstream-class-mapping.md
[J-log]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/docs/upstream-followup-log.md
[J-runtime]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/docs/runtime-java-cli.md
[J-gate]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/TODO.md
[J-snapshot]: https://github.com/igapyon/miku-project-java/blob/aca9809a94b6e15915729c90f1a57a04e66c85de/docs/v1-contract-snapshot.md
[J-history]: https://github.com/igapyon/miku-project-java/commit/ae71a6a
