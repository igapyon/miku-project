# 全作業索引

**実行範囲の記録更新済み。元の75カード中37件完了、2件は人の判断待ち、36件は未着手。完了: PRE-01、PRE-02、LEG-N01、LEG-J01〜LEG-J17、DEC-02、DEC-04〜DEC-10、KEEP-01〜KEEP-05、REF-01、END-01〜END-03。DEC-01/G-HELPとDEC-03/G-REPORTは判断待ち。DEC-02/G-PARENTとDEC-04/G-METAの提案作業は完了したが、各Gateの採用判断はAPPLY-02 / APPLY-04開始前に必要。DEC-10のXML field別提案は完了し、G-XML採択待ち。REF-01は`v1.1.1`を提案したがG-REFERENCE採択待ち。LEG-J08の巨大値上限は未決定。LEG-J14〜J16実行で追加発見したB23/F-S5、B24/F-S6、B25/F-J5は元のカード外。F-J5 implementation is committed in Java HEAD `c0b4421`; RPF-03 public regression additions remain uncommitted. END-03は固定readerによる#137読取、paste-ready comment草案、後続草案の重複確認まで完了。GitHubへの投稿・登録は行っていない。**

[共通手順](README.md)と対象カードを読む。下表の依存は同じ計画のカードID、判断待ちは採用済みの決定・既存Gate記録を指す。依存範囲は両端を含む。索引はカード本文から作成して照合した。

[残作業計画と補充18カード](remaining-work.md)を次回の開始点とする。補充カードは元の75件の上記集計に含めない。REM-01〜04、REM-06〜12、REM-16〜18は完了、REM-05はNode 26 byte mismatch未再現で保留、REM-13〜15は仕様採択待ち。判断パケットは[こちら](../node-java-137-adoption-packet-v20261022.md)。

| ID | 作業 | 依存 | 明示された判断待ち | 状態 |
| --- | --- | --- | --- | --- |
| [PRE-01](legacy.md#pre-01) | 比較基準と作業ツリーを記録する | なし | — | 完了 |
| [PRE-02](legacy.md#pre-02) | legacy比較fixtureと実行結果の器を用意する | PRE-01 | — | 完了 |
| [LEG-N01](legacy.md#leg-n01) | 許可済みのout optionをNode helpへ掲載する | PRE-01 | — | 完了 |
| [LEG-J01](legacy.md#leg-j01) | workbook diffのscalar比較を固定する | PRE-02 | — | 完了 |
| [LEG-J02](legacy.md#leg-j02) | diffのrow構造とtask順を固定する | LEG-J01 | — | 完了 |
| [LEG-J03](legacy.md#leg-j03) | diffの不完全性と不正入力を固定する | LEG-J02 | — | 完了 |
| [LEG-J04](legacy.md#leg-j04) | workbook warningをcommand診断まで追跡する | PRE-02 | — | 完了 |
| [LEG-J05](legacy.md#leg-j05) | 出力失敗時の成功診断を抑える | PRE-02 | — | 完了 |
| [LEG-J06](legacy.md#leg-j06) | option値欠落と余分な位置引数を扱う | PRE-02 | — | 完了（自己レビュー再確認済み） |
| [LEG-J07](legacy.md#leg-j07) | stdinの重複指定を入力前に拒否する | LEG-J06 | — | 完了 |
| [LEG-J08](legacy.md#leg-j08) | max-depthの境界を確認し字句検査を揃える | LEG-J06 | — | 完了（巨大値上限は未決定） |
| [LEG-J09](legacy.md#leg-j09) | draftとpatchのfenced JSON入力を確認する | PRE-02 | — | 完了 |
| [LEG-J10](legacy.md#leg-j10) | kind判定不能を失敗として出力する | PRE-02 | — | 完了 |
| [LEG-J11](legacy.md#leg-j11) | patch validation失敗のreport経路を確認する | LEG-J04、LEG-J09 | — | 完了（自己レビュー再確認済み） |
| [LEG-J12](legacy.md#leg-j12) | binary I/Oの拒否条件とcodeを照合する | LEG-J06 | — | 完了 |
| [LEG-J13](legacy.md#leg-j13) | UTF-8と改行の環境依存を調べる | PRE-02 | — | 完了 |
| [LEG-J14](legacy.md#leg-j14) | AI系7commandの正常導線を比較する | PRE-02、LEG-J04、LEG-J09-LEG-J11 | — | 完了 |
| [LEG-J15](legacy.md#leg-j15) | state系4commandの正常導線を比較する | LEG-J01-LEG-J04、LEG-J07、LEG-J09 | — | 完了 |
| [LEG-J16](legacy.md#leg-j16) | exchange系4commandとcore format/modeを比較する | PRE-02、LEG-J12、KEEP-02 | — | 完了 |
| [LEG-J17](legacy.md#leg-j17) | 帳票7commandの既存parityを確認する | PRE-02、KEEP-03 | — | 完了 |
| [KEEP-01](legacy.md#keep-01) | Java拡張commandと既存入口の維持理由を固定する | PRE-01 | — | 完了 |
| [KEEP-02](legacy.md#keep-02) | Java native列と共通projectionの境界を固定する | PRE-01 | — | 完了 |
| [KEEP-03](legacy.md#keep-03) | 日付なしSVGとdated parityの差を記録する | PRE-01 | — | 完了 |
| [KEEP-04](legacy.md#keep-04) | zero-duration warningの採用範囲を記録する | PRE-01 | — | 完了 |
| [KEEP-05](legacy.md#keep-05) | runtime境界と将来要求を既存範囲に留める | PRE-01 | — | 完了 |
| [DEC-01](decisions.md#dec-01) | legacy helpとoption位置の判断案を作る | PRE-01 | G-HELP | 判断待ち |
| [DEC-02](decisions.md#dec-02) | output親directory作成の判断案を作る | PRE-02 | — | 完了 |
| [DEC-03](decisions.md#dec-03) | Java帳票optionの有効だった範囲を確定する | PRE-01 | G-REPORT | 判断待ち |
| [DEC-04](decisions.md#dec-04) | 凍結I/O metadataのJava側方針を決める材料を集める | PRE-02 | — | 完了 |
| [DEC-05](decisions.md#dec-05) | XMLのProject情報を対応づける | PRE-01 | — | 完了 |
| [DEC-06](decisions.md#dec-06) | XMLのTask情報を対応づける | PRE-01 | — | 完了 |
| [DEC-07](decisions.md#dec-07) | XMLのResource情報を対応づける | PRE-01 | — | 完了 |
| [DEC-08](decisions.md#dec-08) | XMLのAssignment情報を対応づける | PRE-01 | — | 完了 |
| [DEC-09](decisions.md#dec-09) | XMLのCalendar情報を対応づける | PRE-01 | — | 完了 |
| [DEC-10](decisions.md#dec-10) | XMLの差分ごとに判断案をまとめる | DEC-05-DEC-09 | — | 完了 |
| [APPLY-01](decisions.md#apply-01) | 決定済みのhelp/option位置の扱いを反映する | DEC-01 | G-HELP | 未着手 |
| [APPLY-02](decisions.md#apply-02) | 決定済みの親directory方針を反映する | DEC-02、LEG-J05 | G-PARENT | 未着手 |
| [APPLY-03](decisions.md#apply-03) | 決定済みJava帳票optionだけを復旧または明文化する | DEC-03、LEG-J06 | G-REPORT | 未着手 |
| [APPLY-04](decisions.md#apply-04) | 決定済みmetadata互換方針をJavaへ反映する | DEC-04、LEG-J10、LEG-J11 | G-META | 未着手 |
| [APPLY-05](decisions.md#apply-05) | 決定済みXML fieldを一件ずつ反映する | DEC-10 | 対象fieldのG-XML | 未着手 |
| [REF-01](v1.md#ref-01) | 新しいreference identityの採用案を作る | PRE-01 | — | 完了 |
| [REF-02](v1.md#ref-02) | 採用identityからNodeの内部reference candidateを作る | REF-01 | G-REFERENCEのsource/tag採用。実在するexact tagとclean sourceが必要。 | 未着手 |
| [REF-03](v1.md#ref-03) | importerへ採用済みsnapshot identityを追加する | REF-02 | G-REFERENCEのreference manifest / lock digestを含む採用値の確定 | 未着手 |
| [REF-04](v1.md#ref-04) | 新snapshotとverifier/loaderの選択を追加する | REF-03 | — | 未着手 |
| [REF-05](v1.md#ref-05) | P5-C1 validateの再review根拠を揃える | REF-04 | — | 未着手 |
| [V1-01](v1.md#v1-01) | XML readとsemantic stateを共有helperへ切り出す | REF-05 | G-P5-C1 | 未着手 |
| [V1-02](v1.md#v1-02) | canonical JSONとresult構築を共有する | V1-01 | — | 未着手 |
| [V1-03](v1.md#v1-03) | 厳格argvとresult transportを共有する | V1-02 | — | 未着手 |
| [V1-04](v1.md#v1-04) | canonical XML encodeと再decodeを実装する | V1-02 | — | 未着手 |
| [V1-05](v1.md#v1-05) | inspect project_overviewを実装する | V1-03 | — | 未着手 |
| [V1-06](v1.md#v1-06) | inspect task_change_contextを実装する | V1-05 | — | 未着手 |
| [V1-07](v1.md#v1-07) | inspect sliceを統合して技術reviewする | V1-06 | — | 未着手 |
| [V1-08](v1.md#v1-08) | change request検査と進捗一件の純粋変更を実装する | V1-07、V1-04 | — | 未着手 |
| [V1-09](v1.md#v1-09) | output planとdestination preflightを実装する | V1-08 | — | 未着手 |
| [V1-10](v1.md#v1-10) | plan-change serviceとP5-C3確認を完成させる | V1-09 | — | 未着手 |
| [V1-11](v1.md#v1-11) | artifact setのread-only検査部品を作る | V1-10 | — | 未着手 |
| [V1-12](v1.md#v1-12) | approvalとplan/request/runtime bindingを検査する | V1-11 | — | 未着手 |
| [V1-13](v1.md#v1-13) | provenanceを純粋生成する | V1-12 | — | 未着手 |
| [V1-14](v1.md#v1-14) | publisherのexclusive reservationと所有権を作る | V1-13 | — | 未着手 |
| [V1-15](v1.md#v1-15) | member書込・再検査・COMMITTEDを実装する | V1-14 | — | 未着手 |
| [V1-16](v1.md#v1-16) | 所有物だけのcleanupと診断集約を実装する | V1-15 | — | 未着手 |
| [V1-17](v1.md#v1-17) | apply-change serviceを接続する | V1-16 | — | 未着手 |
| [V1-18](v1.md#v1-18) | applyのfailure matrixとunknown outcomeをreviewする | V1-17 | — | 未着手 |
| [V1-19](v1.md#v1-19) | public verify-artifact serviceを実装する | V1-18 | — | 未着手 |
| [V1-20](v1.md#v1-20) | committed artifact setをproject入力へ接続する | V1-19 | — | 未着手 |
| [V1-21](v1.md#v1-21) | 全corpusのcoverageとcross-runtime差分を確認する | V1-20、REF-02、REF-04 | — | 未着手 |
| [V1-22](v1.md#v1-22) | Java runtime manifestのproduction intakeを実装する | V1-21 | G-P5-D | 未着手 |
| [V1-23](v1.md#v1-23) | help/versionをv1 controlとして実装する | V1-22 | — | 未着手 |
| [V1-24](v1.md#v1-24) | v1専用launcherをserviceへ接続する | V1-23 | — | 未着手 |
| [V1-25](v1.md#v1-25) | versioned v1 JAR・sources・manifestを生成する | V1-24 | — | 未着手 |
| [V1-26](v1.md#v1-26) | 隔離consumerで三memberだけを確認する | V1-25 | — | 未着手 |
| [V1-27](v1.md#v1-27) | Gate G5のreview資料を完成させる | V1-26 | — | 未着手 |
| [END-01](closeout.md#end-01) | 比較表と判断記録を更新する | KEEP-01-KEEP-05、DEC-01-DEC-10 | — | 完了 |
| [END-02](closeout.md#end-02) | 実際に変更した作業列の統合確認をする | PRE-01 | 実行範囲に選んだ全カードの完了、または保留理由の記録 | 完了 |
| [END-03](closeout.md#end-03) | 対応先別のIssue草案と引渡しをまとめる | END-01 | #137本文・commentsを現行固定readerで取得。取得経路はREM-16、草案更新はREM-17 | 完了（ローカル草案、未投稿） |

技術的な依存がある作業は、前段が未着手なら開始できない。判断待ち欄が空でも、依存カードを通じてG-P5-C1等の条件を継承する。Gate記録を作るカード自身は、根拠の準備まで進め、決定・承認を代行しない。
