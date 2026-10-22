# 調査結果と後続作業を引き渡すカード

END-01、END-02、END-03は完了。[共通手順](README.md)に従い、#137の調査成果・ローカル報告草案をまとめた。後続のlegacy修正/v1適合は未完了で、判断・Gate待ちの既存cardに残す。

END-03の実行結果と#137報告案は[REM-17結果](remaining-work.md#rem-17)および`workplace/miku-scm/issue-comments/`にある。GitHubへ投稿する場合は別途の明示指示とcomment workflowが必要である。END-01/02/03の整合確認はREM-18で完了した。

<a id="end-01"></a>

### END-01 比較表と判断記録を更新する

- 依存: KEEP-01-KEEP-05、DEC-01-DEC-10
- 対象: Node比較表と両版tracking docs。END-01 historical baselineは90行（RPF-07で監査）。現在のfeature unionはR2F-01追加B26により91行で、B26/F-J6を独立候補として追跡する。LEG-J14/J15で見つかったB23/F-S5とB24/F-S6は未決定、LEG-J16で見つかったB25/F-J5は別候補。
- 入力・範囲: 調査カードの結果、仕様決定記録、XML field inventory、機能・差分判断表、両TODO。
- 手順: 各行の現在値/根拠/判断/次対応を更新。新しい差は安定IDを追加し、消えた差は理由を残す。未決定は判断案と不足証拠に接続し、維持する差は対応不要の理由を残す。
- 完了: 未分類の差がなく、全行から根拠または未解決記録へ辿れる。調査未実施を実行同等と書かず、未完の実装を完了にしない。両repoから同じ正本へ到達できる。
- 確認: DOC。修正列/v1列が未実行でも、その状態を明示した調査版として完成させてよい。

<a id="end-02"></a>

### END-02 実際に変更した作業列の統合確認をする

- 依存: PRE-01
- 判断待ち: 実行範囲に選んだ全カードの完了、または保留理由の記録
- 対象: 実行指示を受け、実際にコードを変更したrepoのみ。
- 入力・範囲: 今回実行したカード一覧、最新diff、focused確認、既存未commit変更のbaseline。
- 手順: Node CLI/core変更があればN-FULL、Javaコード変更があればJ-ALL、共有legacy挙動変更があればJ-PARITYを行う。同じsource状態で既に必要な確認が完了していれば結果を再利用する。v1は各sliceのreview確認も満たす。docsだけならDOCに留める。
- 完了: 失敗/skip/未確認が正確で、変更したコードと最終確認のsourceが一致。frozen snapshot/G4 lockと無関係なversion/sourceが保全されている。diffとstatusを確認し、変更は未stageのまま引き渡す。
- 確認: カード内の対象別確認とDOC。満たせない環境条件は必要なJDK/dependency/assetを具体的に記録する。commit/tag/push/Releaseは含めない。

<a id="end-03"></a>

### END-03 対応先別のIssue草案と引渡しをまとめる

- 依存: END-01
- 対象: Node/Javaの後続作業。既存Issue #137への報告案。
- 入力・範囲: 比較表F-*、完了/未完カード、仕様判断・既存Gate記録。
- 手順: coherentなscopeごとにNode help、Java legacy回帰/互換修正、仕様判断、reference更新、Gate G5残件の草案を分ける。miku-scmの`writing.issue.prepare`固定helperで既存Issue等の証拠を集め、重複があれば既存追跡への接続を提案する。各草案へ対象repo、行ID、カードID、前提、受入条件、非対象を記載する。
- 完了: 人が確認できる保存済み草案のpathと、#137の調査結果報告案がある。実装未完・判断待ち・差異維持が読み分けられる。#137のGitHub上での完了や後続Issue作成は、実行した事実がない限り記録しない。
- 確認: DOCとmiku-scm writing evidenceの対応。GitHubへの投稿・更新・閉鎖はこのカードに含めず、別途指示されたSCM workflowへ渡す。
