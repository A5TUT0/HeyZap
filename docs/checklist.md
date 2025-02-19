# ✅ Projekt-Checkliste: Chat-Anwendung

## 📌 (0-6 Punkte) Client Komponente

- [x] (0-1 Punkt) Der Client erlaubt es sich zu registrieren.
- [x] (0-1 Punkt) Der Client erlaubt es sich anzumelden.
- [x] (0-1 Punkt) Der Benutzername kann angepasst werden.
- [x] (0-1 Punkt) Der Client erlaubt es, sich in einen Chatraum zu verbinden und Nachrichten zu lesen.  
       Bestehende Nachrichten werden beim Start automatisch geladen.
- [x] (0-1 Punkt) Der Client erlaubt es, sich in einen Chatraum zu verbinden und darin aktive Teilnehmer einzusehen.
- [x] (0-1 Punkt) Der Client bekommt in Echtzeit neue Nachrichten mitgeteilt, ohne dass der Benutzer selbst aktualisieren muss.

## 📌 (0-3 Punkte) Backend Komponente

- [x] (0-1 Punkt) Das Backend verteilt Nachrichten an alle verbundenen Clients in Echtzeit.
- [x] (0-1 Punkt) Das Backend speichert Benutzer & Nachrichten in der Datenbank.
- [?] (0-1 Punkt) Das Backend ist gegen unerlaubten Zugriff geschützt und ein Benutzer kann nur Aktionen für sich und in seinem Namen durchführen.

## 📌 (0-2 Punkte) Datenbank Komponente

- [x] (0-1 Punkt) Persistiert Nachrichten & Benutzer, sodass diese über einen Neustart hinaus verfügbar bleiben.
- [x] (0-1 Punkt) Nachrichten und Benutzer sind konsistent und als sinnvolle Datenstruktur abgelegt.

## 📌 (0-2 Punkte) Testen des verteilten Systems

- [ ] (0-1 Punkt) Für alle Systemteile ist beschrieben, was ein Ausfall der jeweiligen Systemkomponente für das Gesamtsystem zu bedeuten hätte  
       und wie die jeweilige Komponente ausfallsicherer gebaut werden kann. Dies ist in einem Dokument festgehalten.
- [ ] (0-1 Punkt) Der Client ist durch Testfälle im Blackbox-Testverfahren abgedeckt, und die erfolgreiche Durchführung ist in einem Testprotokoll festgehalten.

## 📌 (0-2 Punkte) Bereitstellung der Applikationen als Container mit «Docker»

- [ ] (0-1 Punkt) Applikation ist als «Docker» Image auf Docker Hub und mit Dockerfile vorhanden.
- [ ] (0-1 Punkt) MariaDB Datenbank und passendes Docker Compose für alle Services vorhanden  
       und es ist auf einem fremden System ohne Anpassung lauffähig.

## 📌 (0-2 Punkte) Versionsverwaltung mit «git»

- [x] (0-1 Punkt) «git» Repository auf Github vorhanden & Commit-Kommentare sind sinnvoll sowie verständlich.
- [x] (0-1 Punkt) Commits werden regelmäßig über den Zeitraum der Umsetzung erstellt.
