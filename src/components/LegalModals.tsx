import { Modal } from "./FeatureModals";

export function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Rreth VaktiaKS" onClose={onClose}>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/85">
        <p>
          VaktiaKS është platforma juaj dixhitale për oraret zyrtare të namazit në Kosovë dhe
          Shqipëri, orientimin drejt Kibles, tespihun dhe ndjekjen e zakoneve ditore.
        </p>
        <p className="text-muted-foreground">
          Të dhënat bazohen në takvimin zyrtar të Bashkësisë Islame të Kosovës (BIK) dhe
          Komunitetit Mysliman të Shqipërisë (KMSH).
        </p>
      </div>
    </Modal>
  );
}

export function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Kushtet e Përdorimit" onClose={onClose}>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/85">
        <p>
          VaktiaKS ofrohet pa pagesë për përdorim personal dhe në ambiente xhamie/qendra
          komunitare. Përmbajtja fetare është informative dhe bazohet në burime zyrtare.
        </p>
        <p className="text-muted-foreground">
          Oraret mund të kenë devijime minutash sipas lokacionit; për saktësi maksimale
          përdorni rregullimet e kohëve dhe qytetin tuaj.
        </p>
        <p className="text-muted-foreground">
          Përdorimi i platformës nënkupton pranimin e këtyre kushteve.
        </p>
      </div>
    </Modal>
  );
}

export function PrivacyModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Politika e Privatësisë" onClose={onClose}>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/85">
        <p>
          VaktiaKS nuk krijon llogari dhe nuk ruan të dhëna personale në server. Të gjitha
          preferencat (qyteti, gjuha, tespihu, kazat, seritë) ruhen vetëm në pajisjen tuaj përmes
          localStorage.
        </p>
        <p className="text-muted-foreground">
          Lokacioni përdoret vetëm me lejen tuaj për të gjetur xhaminë më të afërt dhe nuk
          transmetohet tek ne. Mund të fshini të dhënat duke pastruar të dhënat e shfletuesit.
        </p>
      </div>
    </Modal>
  );
}
