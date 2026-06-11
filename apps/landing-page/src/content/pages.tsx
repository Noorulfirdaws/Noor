import { CheckCircle2, MapPin, Phone, Mail, Star, Briefcase, ShieldCheck, Clock, Car, ChevronDown } from 'lucide-react';
import { useState } from 'react';

// ── Shared UI helpers ─────────────────────────────────────────────────────────

function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl font-bold text-white mb-2">{children}</h1>;
}
function PageLead({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 text-base leading-relaxed mb-8 border-b border-white/10 pb-8">{children}</p>;
}
function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      {title && <h2 className="text-white font-semibold text-lg mb-4">{title}</h2>}
      {children}
    </div>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-block bg-brand/10 text-brand text-xs font-semibold px-2.5 py-1 rounded-full border border-brand/20 mr-2 mb-2">{children}</span>;
}
function InfoCard({ icon: Icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10 mb-3">
      <Icon size={20} className="text-brand shrink-0 mt-0.5" />
      <div>
        <p className="text-white font-semibold text-sm mb-1">{title}</p>
        <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="flex gap-4 mb-5">
      <div className="w-8 h-8 rounded-full bg-brand text-white text-sm font-bold flex items-center justify-center shrink-0">{n}</div>
      <div>
        <p className="text-white font-semibold mb-1">{title}</p>
        <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl mb-3 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-white font-medium text-sm pr-4">{q}</span>
        <ChevronDown size={16} className={`text-brand shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/10 pt-4">{a}</div>}
    </div>
  );
}

// ── Page Components ───────────────────────────────────────────────────────────

function APropos() {
  return (
    <>
      <PageTitle>À propos de DjiRide</PageTitle>
      <PageLead>DjiRide est la première plateforme de mobilité urbaine 100% djiboutienne. Née à Djibouti-Ville en 2024, notre mission est de rendre les déplacements accessibles, sûrs et abordables pour tous.</PageLead>
      <Section title="Notre histoire">
        <p className="text-slate-400 text-sm leading-relaxed mb-4">Fondée par une équipe d'entrepreneurs djiboutiens, DjiRide est née d'un constat simple : se déplacer à Djibouti manquait de fiabilité, de transparence et de sécurité. Nous avons décidé de changer ça.</p>
        <p className="text-slate-400 text-sm leading-relaxed">En moins d'un an, plus de 500 chauffeurs partenaires nous ont rejoints et des milliers de trajets ont été effectués à travers Djibouti-Ville, Balbala et au-delà.</p>
      </Section>
      <Section title="Nos valeurs">
        <InfoCard icon={ShieldCheck} title="Sécurité avant tout" body="Chaque chauffeur est vérifié. Chaque trajet est suivi. La sécurité n'est pas une option chez DjiRide." />
        <InfoCard icon={MapPin} title="Ancrage local" body="Nous connaissons chaque quartier de Djibouti. Nos équipes sont djiboutiennes et au service des Djiboutiens." />
        <InfoCard icon={Star} title="Excellence du service" body="Note moyenne de 4.8/5. Nous travaillons chaque jour pour maintenir ce standard." />
      </Section>
      <Section title="En chiffres">
        <div className="grid grid-cols-3 gap-4">
          {[['500+', 'Chauffeurs actifs'], ['6', 'Régions couvertes'], ['4.8★', 'Note moyenne']].map(([n, l]) => (
            <div key={l} className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
              <p className="text-2xl font-bold text-brand">{n}</p>
              <p className="text-slate-400 text-xs mt-1">{l}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function Confidentialite() {
  return (
    <>
      <PageTitle>Politique de confidentialité</PageTitle>
      <PageLead>Dernière mise à jour : janvier 2025. DjiRide s'engage à protéger vos données personnelles conformément aux lois djiboutiennes en vigueur.</PageLead>
      {[
        ['Données collectées', 'Nous collectons votre nom, numéro de téléphone, adresse e-mail, position GPS pendant les trajets et historique des courses. Ces données sont nécessaires au fonctionnement du service.'],
        ['Utilisation des données', 'Vos données sont utilisées pour : mettre en relation passagers et chauffeurs, améliorer notre service, assurer la sécurité des utilisateurs et traiter vos paiements via WAAFI et D-Money.'],
        ['Partage des données', 'Nous ne vendons jamais vos données. Elles peuvent être partagées uniquement avec : votre chauffeur (nom et position), nos prestataires de paiement agréés, et les autorités djiboutiennes en cas d\'obligation légale.'],
        ['Vos droits', 'Vous pouvez à tout moment : consulter vos données, demander leur modification ou suppression, vous opposer à leur traitement. Contactez-nous à privacy@djiride.dj.'],
        ['Sécurité', 'Vos données sont chiffrées en transit (TLS) et au repos. Nous utilisons une authentification sécurisée et des audits réguliers de sécurité.'],
        ['Conservation', 'Vos données sont conservées 3 ans après votre dernière activité sur la plateforme, sauf obligation légale contraire.'],
      ].map(([title, body]) => (
        <Section key={title as string} title={title as string}>
          <p className="text-slate-400 text-sm leading-relaxed">{body as string}</p>
        </Section>
      ))}
    </>
  );
}

function Conditions() {
  return (
    <>
      <PageTitle>Conditions d'utilisation</PageTitle>
      <PageLead>En utilisant DjiRide, vous acceptez les présentes conditions. Veuillez les lire attentivement.</PageLead>
      {[
        ['Eligibilité', 'Vous devez avoir au moins 18 ans pour utiliser DjiRide. En tant que passager, vous devez posséder un compte actif et une méthode de paiement valide.'],
        ['Utilisation du service', 'DjiRide est destiné à des déplacements légaux sur le territoire djiboutien. Toute utilisation frauduleuse, illégale ou abusive entraîne la suspension immédiate du compte.'],
        ['Tarification', 'Les tarifs sont affichés avant chaque course. Un dépôt de 200 DJF est prélevé à la réservation. Des frais d\'attente de 50 DJF/minute s\'appliquent au-delà de 5 minutes.'],
        ['Annulations', 'Une annulation gratuite est possible dans les 2 minutes suivant la confirmation. Au-delà, des frais d\'annulation peuvent s\'appliquer.'],
        ['Responsabilités', 'DjiRide met en relation des passagers et des chauffeurs indépendants. En cas de litige, notre équipe de support est disponible 24h/7j pour arbitrer.'],
        ['Modifications', 'DjiRide se réserve le droit de modifier ces conditions. Vous serez notifié par e-mail et via l\'application 30 jours avant toute modification majeure.'],
      ].map(([title, body]) => (
        <Section key={title as string} title={title as string}>
          <p className="text-slate-400 text-sm leading-relaxed">{body as string}</p>
        </Section>
      ))}
    </>
  );
}

function Cookies() {
  return (
    <>
      <PageTitle>Politique de cookies</PageTitle>
      <PageLead>DjiRide utilise des cookies pour améliorer votre expérience. Voici ce que vous devez savoir.</PageLead>
      <Section title="Qu'est-ce qu'un cookie ?">
        <p className="text-slate-400 text-sm leading-relaxed">Un cookie est un petit fichier texte déposé sur votre appareil lorsque vous visitez notre site. Il nous permet de mémoriser vos préférences et d'analyser l'utilisation du service.</p>
      </Section>
      <Section title="Cookies utilisés">
        {[
          ['Cookies essentiels', 'Nécessaires au fonctionnement du site : session utilisateur, sécurité, préférences de langue. Ils ne peuvent pas être désactivés.'],
          ['Cookies analytiques', 'Nous aident à comprendre comment vous utilisez DjiRide afin d\'améliorer nos services. Données anonymisées uniquement.'],
          ['Cookies de performance', 'Optimisent le chargement des pages et la carte interactive. Aucune donnée personnelle n\'est collectée.'],
        ].map(([title, body]) => (
          <div key={title as string} className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-white font-semibold text-sm mb-1">{title as string}</p>
            <p className="text-slate-400 text-sm">{body as string}</p>
          </div>
        ))}
      </Section>
      <Section title="Gérer vos cookies">
        <p className="text-slate-400 text-sm leading-relaxed">Vous pouvez configurer votre navigateur pour refuser les cookies ou être averti de leur dépôt. Notez que certaines fonctionnalités pourraient ne plus être disponibles.</p>
      </Section>
    </>
  );
}

function Aide() {
  const faqs = [
    ['Comment réserver un trajet ?', 'Téléchargez l\'app DjiRide, créez un compte, entrez votre destination, confirmez votre position de départ et appuyez sur "Réserver". Un chauffeur sera assigné en quelques secondes.'],
    ['Combien coûte un trajet ?', 'Le prix est calculé en fonction de la distance et du temps. Un dépôt de 200 DJF est prélevé à la réservation. Des frais d\'attente de 50 DJF/minute s\'appliquent après 5 minutes gratuites.'],
    ['Comment payer ?', 'DjiRide accepte WAAFI, D-Money et paiement en espèces. Choisissez votre méthode préférée dans les paramètres de l\'application.'],
    ['Mon chauffeur n\'est pas arrivé ?', 'Attendez 10 minutes, puis signalez un "no-show" dans l\'app. Le dépôt vous sera remboursé intégralement sous 24h.'],
    ['Comment devenir chauffeur ?', 'Téléchargez l\'app chauffeur, soumettez vos documents (identité, permis, carte grise) et acceptez le Contrat DjibRide. Validation sous 48h.'],
    ['Comment signaler un problème ?', 'Dans l\'app, allez sur le trajet concerné et appuyez sur "Signaler". Notre équipe répond sous 2 heures en semaine.'],
    ['Puis-je annuler une réservation ?', 'Oui, gratuitement dans les 2 premières minutes. Passé ce délai, des frais d\'annulation de 100 DJF peuvent s\'appliquer.'],
    ['L\'application est-elle disponible en dehors de Djibouti ?', 'Non. DjiRide opère exclusivement à Djibouti. L\'application ne fonctionne que sur le territoire djiboutien.'],
  ];
  return (
    <>
      <PageTitle>Centre d'aide</PageTitle>
      <PageLead>Trouvez rapidement une réponse à vos questions les plus fréquentes. Notre équipe est disponible 24h/7j.</PageLead>
      <Section title="Questions fréquentes">
        {faqs.map(([q, a]) => <FAQ key={q} q={q} a={a} />)}
      </Section>
      <Section title="Nous contacter">
        <InfoCard icon={Phone} title="+253 77 00 00 00" body="Support disponible 24h/7j pour les urgences liées à un trajet en cours." />
        <InfoCard icon={Mail} title="support@djiride.dj" body="Pour toute demande non urgente, notre équipe répond sous 4 heures ouvrables." />
      </Section>
    </>
  );
}

function DevenirPartenaire() {
  return (
    <>
      <PageTitle>Devenir chauffeur partenaire</PageTitle>
      <PageLead>Rejoignez la communauté DjiRide et commencez à gagner votre vie à votre rythme. Plus de 500 chauffeurs nous font déjà confiance.</PageLead>
      <Section title="Comment ça marche ?">
        <Step n={1} title="Téléchargez l'app chauffeur" body="Disponible sur Google Play et App Store. Créez votre compte avec votre numéro de téléphone djiboutien." />
        <Step n={2} title="Soumettez vos documents" body="Carte d'identité nationale, permis de conduire valide et carte grise du véhicule. Acceptez le Contrat DjibRide." />
        <Step n={3} title="Validation sous 48h" body="Notre équipe vérifie vos documents et valide votre profil. Vous recevez une notification dès l'approbation." />
        <Step n={4} title="Commencez à conduire" body="Activez votre statut 'en ligne' et acceptez les courses dans votre zone. Les paiements arrivent sur WAAFI ou D-Money." />
      </Section>
      <Section title="Conditions requises">
        {['Être titulaire d\'un permis de conduire valide', 'Posséder un véhicule en bon état de marche', 'Avoir plus de 21 ans et 2 ans de permis', 'Casier judiciaire vierge', 'Carte d\'identité nationale djiboutienne'].map(c => (
          <div key={c} className="flex items-center gap-3 py-2.5 border-b border-white/5">
            <CheckCircle2 size={16} className="text-brand shrink-0" />
            <span className="text-slate-300 text-sm">{c}</span>
          </div>
        ))}
      </Section>
      <Section title="Vos revenus">
        <div className="bg-brand/10 border border-brand/20 rounded-xl p-5">
          <p className="text-brand font-bold text-lg mb-1">Jusqu'à 150 000 DJF / mois</p>
          <p className="text-slate-400 text-sm">Estimation pour un chauffeur travaillant 8h/jour en zone urbaine. Les revenus varient selon la disponibilité et la zone.</p>
        </div>
      </Section>
    </>
  );
}

function Revenus() {
  return (
    <>
      <PageTitle>Vos revenus avec DjiRide</PageTitle>
      <PageLead>Transparence totale sur vos gains. Vous savez exactement ce que vous gagnez et quand vous êtes payé.</PageLead>
      <Section title="Structure tarifaire">
        <div className="space-y-3">
          {[['Prise en charge', '500 DJF', 'Tarif de base à chaque course acceptée'],['Tarif kilométrique', '100 DJF/km', 'Calculé sur la distance réelle parcourue'],['Frais d\'attente', '50 DJF/min', 'À partir de la 6ème minute d\'attente'],['Bonus nuit', '+20%', 'Trajets effectués entre 22h et 6h'],].map(([label, value, desc]) => (
            <div key={label as string} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-white font-semibold text-sm">{label as string}</p>
                <p className="text-slate-500 text-xs">{desc as string}</p>
              </div>
              <span className="text-brand font-bold">{value as string}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Paiements">
        <InfoCard icon={Clock} title="Versement hebdomadaire" body="Vos gains sont versés chaque lundi directement sur WAAFI ou D-Money. Aucun délai surprise." />
        <InfoCard icon={ShieldCheck} title="Aucune déduction cachée" body="DjiRide prélève une commission de 15% par course. Tout le reste vous revient." />
      </Section>
    </>
  );
}

function Assurance() {
  return (
    <>
      <PageTitle>Contrat DjibRide</PageTitle>
      <PageLead>En utilisant la plateforme DjibRide, vous acceptez notre Contrat d'Utilisation. DjibRide est une plateforme de mise en relation — non un prestataire de transport.</PageLead>
      <Section title="Ce que DjibRide est">
        <InfoCard icon={ShieldCheck} title="Plateforme technologique" body="DjibRide met en relation des clients et des chauffeurs indépendants. Nous ne fournissons pas de service de transport." />
        <InfoCard icon={Star} title="Accès par abonnement" body="Chauffeur : 500 DJF/mois. Client : 100 DJF/mois. L'abonnement donne accès à la plateforme. Les revenus des courses appartiennent intégralement aux chauffeurs." />
        <InfoCard icon={Car} title="Compensation en cas de panne" body="Si la plateforme tombe en panne 30 jours cumulés, vous recevez automatiquement 1 mois gratuit. Aucun remboursement en argent ne sera effectué." />
      </Section>
      <Section title="Ce que DjibRide ne fait pas">
        <p className="text-slate-400 text-sm leading-relaxed">DjibRide n'intervient pas dans les paiements, litiges, annulations, objets perdus ou tout accord entre clients et chauffeurs. Chaque partie est seule responsable de ses engagements. DjibRide n'est pas un assureur et ne propose aucune couverture d'assurance.</p>
      </Section>
      <Section title="Historique numérique comme preuve">
        <InfoCard icon={ShieldCheck} title="Enregistrement GPS complet" body="Chaque trajet est enregistré par GPS : itinéraire exact, heure de départ et d'arrivée, identité du chauffeur et du client. DjibRide dispose de toutes les preuves techniques pour vérifier les faits en cas de besoin." />
        <p className="text-slate-400 text-sm leading-relaxed mt-3">Ces données sont conservées de manière sécurisée et peuvent être consultées par les autorités compétentes à Djibouti dans le cadre d'une procédure légale. Elles constituent un historique numérique fiable et horodaté de chaque course effectuée sur la plateforme.</p>
      </Section>
      <Section title="Consulter le contrat complet">
        <p className="text-slate-400 text-sm leading-relaxed">Le contrat complet (Conditions Générales d'Utilisation) est disponible lors de l'inscription et accessible à tout moment depuis les paramètres de votre compte. L'inscription vaut acceptation intégrale du contrat.</p>
      </Section>
    </>
  );
}

function Formation() {
  return (
    <>
      <PageTitle>Formation DjiRide</PageTitle>
      <PageLead>Avant de commencer à conduire, chaque chauffeur suit un programme de formation en ligne conçu par notre équipe.</PageLead>
      <Section title="Programme de formation">
        {[
          ['Module 1 — Utilisation de l\'app', '30 min', 'Maîtriser l\'application chauffeur : accepter des courses, naviguer, contacter les passagers.'],
          ['Module 2 — Service client', '45 min', 'Accueil des passagers, communication, gestion des situations difficiles.'],
          ['Module 3 — Sécurité routière', '60 min', 'Rappel des règles de conduite, gestion de la fatigue, conduite de nuit.'],
          ['Module 4 — Paiements et revenus', '20 min', 'Comprendre votre relevé de gains, paiement WAAFI/D-Money, gestion fiscale.'],
        ].map(([title, duration, desc]) => (
          <div key={title as string} className="p-4 bg-white/5 rounded-xl border border-white/10 mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-semibold text-sm">{title as string}</p>
              <span className="text-xs text-brand bg-brand/10 px-2 py-0.5 rounded-full">{duration as string}</span>
            </div>
            <p className="text-slate-400 text-sm">{desc as string}</p>
          </div>
        ))}
      </Section>
      <Section>
        <p className="text-slate-400 text-sm">La formation est gratuite, accessible depuis l'app, et peut être suivie à votre rythme. Une note minimale de 80% est requise pour activer votre compte.</p>
      </Section>
    </>
  );
}

function Trajets() {
  return (
    <>
      <PageTitle>Service de trajets</PageTitle>
      <PageLead>Réservez un véhicule en moins de 30 secondes, où que vous soyez à Djibouti.</PageLead>
      <Section title="Comment réserver">
        <Step n={1} title="Ouvrez l'app DjiRide" body="Connectez-vous à votre compte passager. Votre position est détectée automatiquement." />
        <Step n={2} title="Entrez votre destination" body="Tapez une adresse ou sélectionnez un lieu sur la carte. Le tarif estimé s'affiche immédiatement." />
        <Step n={3} title="Confirmez et attendez" body="Un chauffeur accepte votre course et arrive en moins de 5 minutes en moyenne." />
        <Step n={4} title="Profitez du trajet" body="Suivez la progression en temps réel. À la fin du trajet, notez votre chauffeur." />
      </Section>
      <Section title="Types de véhicules">
        {[['DjiEco', 'Berline standard', 'À partir de 500 DJF'], ['DjiComfort', 'Berline premium', 'À partir de 800 DJF'], ['DjiSUV', 'SUV 7 places', 'À partir de 1 200 DJF']].map(([name, type, price]) => (
          <div key={name as string} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 mb-3">
            <div>
              <p className="text-white font-semibold text-sm">{name as string}</p>
              <p className="text-slate-400 text-xs">{type as string}</p>
            </div>
            <span className="text-brand font-bold text-sm">{price as string}</span>
          </div>
        ))}
      </Section>
    </>
  );
}

function Livraison() {
  return (
    <>
      <PageTitle>DjiRide Livraison</PageTitle>
      <PageLead>Vos restaurants préférés de Djibouti livrés chez vous. Rapide, suivi, et abordable.</PageLead>
      <Section title="Comment ça marche">
        <Step n={1} title="Choisissez votre restaurant" body="Parcourez les restaurants partenaires à Djibouti-Ville et Balbala." />
        <Step n={2} title="Composez votre commande" body="Ajoutez vos plats au panier, confirmez votre adresse de livraison." />
        <Step n={3} title="Suivi en temps réel" body="Suivez votre livreur sur la carte depuis l'application." />
        <Step n={4} title="Réception et paiement" body="Payez via WAAFI, D-Money ou en espèces à la livraison." />
      </Section>
      <Section title="Zones de livraison">
        {['Djibouti-Ville', 'Balbala', 'Plateau du Serpent', 'Haramous'].map(z => (
          <div key={z} className="flex items-center gap-3 py-2.5 border-b border-white/5">
            <MapPin size={14} className="text-brand shrink-0" />
            <span className="text-slate-300 text-sm">{z}</span>
          </div>
        ))}
      </Section>
      <Section>
        <div className="bg-brand/10 border border-brand/20 rounded-xl p-4">
          <p className="text-brand font-semibold text-sm mb-1">Frais de livraison : 200 DJF fixe</p>
          <p className="text-slate-400 text-sm">Quel que soit le restaurant, la distance ou la commande.</p>
        </div>
      </Section>
    </>
  );
}

function TransportPro() {
  return (
    <>
      <PageTitle>DjiRide Pro — Entreprises</PageTitle>
      <PageLead>Solutions de mobilité sur mesure pour les entreprises, ambassades et organisations opérant à Djibouti.</PageLead>
      <Section title="Ce que nous offrons">
        <InfoCard icon={Briefcase} title="Compte entreprise centralisé" body="Gérez les déplacements de toute votre équipe depuis un tableau de bord unique. Facturation mensuelle consolidée." />
        <InfoCard icon={Car} title="Flotte dédiée" body="Véhicules réservés exclusivement à votre organisation. Chauffeurs attitrés et formés à votre culture d'entreprise." />
        <InfoCard icon={ShieldCheck} title="Rapports détaillés" body="Exportez des rapports de déplacements, de coûts et d'émissions CO₂ pour votre comptabilité." />
      </Section>
      <Section title="Ils nous font confiance">
        <div className="grid grid-cols-2 gap-3">
          {['Ambassades', 'ONG internationales', 'Port de Djibouti', 'Hôtels 5 étoiles', 'Cliniques privées', 'Entreprises BTP'].map(c => (
            <div key={c} className="bg-white/5 rounded-lg p-3 text-center text-slate-300 text-sm border border-white/10">{c}</div>
          ))}
        </div>
      </Section>
      <Section>
        <div className="bg-brand/10 border border-brand/20 rounded-xl p-5">
          <p className="text-white font-bold mb-2">Intéressé ?</p>
          <p className="text-slate-400 text-sm mb-3">Contactez notre équipe commerciale pour un devis personnalisé.</p>
          <p className="text-brand font-semibold text-sm">pro@djiride.dj · +253 77 00 00 01</p>
        </div>
      </Section>
    </>
  );
}

function Tarifs() {
  return (
    <>
      <PageTitle>Tarifs DjiRide</PageTitle>
      <PageLead>Tarification claire et transparente. Le prix affiché avant la course est le prix final.</PageLead>
      <Section title="Trajets passagers">
        {[
          ['Dépôt de réservation', '200 DJF', 'Déduit du tarif final'],
          ['Prise en charge', '500 DJF', 'Tarif de base'],
          ['Tarif kilométrique', '100 DJF/km', 'Distance réelle'],
          ['Attente (>5 min)', '50 DJF/min', 'Après 5 min gratuites'],
          ['Annulation tardive', '100 DJF', 'Après 2 minutes'],
        ].map(([label, price, note]) => (
          <div key={label as string} className="flex items-center justify-between py-3 border-b border-white/10">
            <div>
              <p className="text-white text-sm font-medium">{label as string}</p>
              <p className="text-slate-500 text-xs">{note as string}</p>
            </div>
            <span className="text-brand font-bold text-sm">{price as string}</span>
          </div>
        ))}
      </Section>
      <Section title="Livraison">
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <p className="text-white text-sm font-medium">Frais de livraison fixe</p>
          <span className="text-brand font-bold text-sm">200 DJF</span>
        </div>
      </Section>
      <Section>
        <p className="text-slate-500 text-xs">Tous les prix sont exprimés en Francs Djiboutiens (DJF). TVA incluse.</p>
      </Section>
    </>
  );
}

function Carrieres() {
  const jobs = [
    { title: 'Responsable Opérations', type: 'CDI · Djibouti-Ville', desc: 'Superviser les opérations quotidiennes, gérer les chauffeurs partenaires et optimiser la couverture.' },
    { title: 'Développeur Mobile Flutter', type: 'CDI · Remote possible', desc: 'Développer et maintenir les applications iOS/Android de DjiRide.' },
    { title: 'Agent Support Client', type: 'CDD · Djibouti-Ville', desc: 'Assister les passagers et chauffeurs via téléphone et chat. Bilingue français/somali requis.' },
    { title: 'Responsable Marketing Digital', type: 'CDI · Djibouti-Ville', desc: 'Gérer la présence sociale de DjiRide et les campagnes d\'acquisition.' },
  ];
  return (
    <>
      <PageTitle>Carrières chez DjiRide</PageTitle>
      <PageLead>Rejoignez l'équipe qui révolutionne la mobilité à Djibouti. Nous cherchons des talents passionnés et engagés.</PageLead>
      <Section title="Postes ouverts">
        {jobs.map(job => (
          <div key={job.title} className="p-5 bg-white/5 rounded-xl border border-white/10 mb-3 hover:border-brand/40 transition-colors cursor-pointer">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-white font-semibold">{job.title}</p>
              <Tag>{job.type}</Tag>
            </div>
            <p className="text-slate-400 text-sm">{job.desc}</p>
          </div>
        ))}
      </Section>
      <Section>
        <div className="bg-brand/10 border border-brand/20 rounded-xl p-5">
          <p className="text-white font-bold mb-1">Candidature spontanée</p>
          <p className="text-slate-400 text-sm mb-2">Vous ne trouvez pas le poste idéal ? Envoyez-nous votre CV.</p>
          <p className="text-brand font-semibold text-sm">jobs@djiride.dj</p>
        </div>
      </Section>
    </>
  );
}

function Presse() {
  return (
    <>
      <PageTitle>Espace Presse</PageTitle>
      <PageLead>Vous êtes journaliste ou média ? Retrouvez ici nos communiqués, notre kit média et les contacts presse.</PageLead>
      <Section title="Derniers communiqués">
        {[
          ['Janvier 2025', 'Lancement officiel de DjiRide à Djibouti-Ville', 'Après 6 mois de phase bêta, DjiRide ouvre ses portes au grand public avec 200 chauffeurs partenaires certifiés.'],
          ['Mars 2025', 'Extension du service à Balbala et Ali Sabieh', 'DjiRide étend sa couverture à deux nouvelles villes, portant son réseau à plus de 500 chauffeurs actifs.'],
          ['Mai 2025', 'Lancement du service de livraison DjiRide Food', 'Les habitants de Djibouti-Ville peuvent désormais commander leurs repas via l\'application DjiRide.'],
        ].map(([date, title, body]) => (
          <div key={title as string} className="mb-5 pb-5 border-b border-white/10">
            <span className="text-xs text-brand font-semibold">{date as string}</span>
            <p className="text-white font-semibold mt-1 mb-2">{title as string}</p>
            <p className="text-slate-400 text-sm leading-relaxed">{body as string}</p>
          </div>
        ))}
      </Section>
      <Section title="Contact presse">
        <InfoCard icon={Mail} title="presse@djiride.dj" body="Demandes d'interview, d'informations ou de visuels. Réponse sous 24h." />
      </Section>
    </>
  );
}

function Contact() {
  return (
    <>
      <PageTitle>Nous contacter</PageTitle>
      <PageLead>Notre équipe est disponible 24h/7j pour vous aider. Choisissez le canal qui vous convient.</PageLead>
      <Section title="Canaux de contact">
        <InfoCard icon={Phone} title="+253 77 00 00 00" body="Support passagers et chauffeurs. Disponible 24h/7j pour tout problème lié à un trajet." />
        <InfoCard icon={Mail} title="support@djiride.dj" body="Pour les questions générales. Réponse sous 4 heures en semaine." />
        <InfoCard icon={Briefcase} title="pro@djiride.dj" body="Partenariats, comptes entreprise, et demandes B2B." />
        <InfoCard icon={MapPin} title="Djibouti-Ville, République de Djibouti" body="Notre siège est situé au cœur de Djibouti-Ville. Sur rendez-vous uniquement." />
      </Section>
      <Section title="Formulaire rapide">
        <div className="space-y-3">
          {[['Votre nom', 'text'], ['Votre email', 'email'], ['Votre message', 'textarea']].map(([label, type]) => (
            <div key={label}>
              <label className="text-slate-400 text-xs mb-1 block">{label}</label>
              {type === 'textarea'
                ? <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand transition-colors resize-none" placeholder={label as string} />
                : <input type={type} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-brand transition-colors" placeholder={label as string} />
              }
            </div>
          ))}
          <button className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-3 rounded-xl transition-colors text-sm">
            Envoyer le message
          </button>
        </div>
      </Section>
    </>
  );
}

// ── Registry ──────────────────────────────────────────────────────────────────

const pages: Record<string, { category: string; Component: () => JSX.Element }> = {
  'a-propos':           { category: 'Entreprise',  Component: APropos },
  'confidentialite':    { category: 'Légal',        Component: Confidentialite },
  'conditions':         { category: 'Légal',        Component: Conditions },
  'cookies':            { category: 'Légal',        Component: Cookies },
  'aide':               { category: 'Support',      Component: Aide },
  'devenir-partenaire': { category: 'Chauffeurs',   Component: DevenirPartenaire },
  'revenus':            { category: 'Chauffeurs',   Component: Revenus },
  'assurance':          { category: 'Chauffeurs',   Component: Assurance },
  'formation':          { category: 'Chauffeurs',   Component: Formation },
  'trajets':            { category: 'Produit',      Component: Trajets },
  'livraison':          { category: 'Produit',      Component: Livraison },
  'transport-pro':      { category: 'Produit',      Component: TransportPro },
  'tarifs':             { category: 'Produit',      Component: Tarifs },
  'carrieres':          { category: 'Entreprise',   Component: Carrieres },
  'presse':             { category: 'Entreprise',   Component: Presse },
  'contact':            { category: 'Entreprise',   Component: Contact },
};

export function getPageContent(slug: string) {
  return pages[slug] || null;
}
