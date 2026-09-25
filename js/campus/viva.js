/**
 * MTMC26 — Question of the Day / Daily Viva Recall Module
 * Automated 24-hour rotating high-yield 1st MBBS viva questions
 * across Anatomy, Physiology, and Biochemistry.
 */

(function () {
  // 30 Curated High-Yield 1st MBBS Viva Questions & Pearls
  const VIVA_QUESTIONS = [
    {
      id: 1,
      subject: 'Anatomy',
      topic: 'Brachial Plexus & Upper Limb',
      question: "What is Erb's Palsy? Which nerve roots are involved, and what is the characteristic deformity?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Roots involved:</strong> Upper trunk (principally <strong>C5, C6</strong>) at Erb's point.</li>
          <li><strong>Cause:</strong> Undue traction during difficult breech delivery or fall on shoulder.</li>
          <li><strong>Characteristic deformity:</strong> <em>Policeman's tip</em> or <em>Waiter's tip</em> hand.</li>
          <li><strong>Limb position:</strong> Arm hangs by the side (adducted), medially rotated; forearm extended and pronated.</li>
          <li><strong>Muscles paralyzed:</strong> Deltoid, Biceps brachii, Brachialis, Supraspinatus, Infraspinatus, Teres minor.</li>
        </ul>
      `,
      vivaTip: "Examiners often ask: 'What are the 6 nerves meeting at Erb's point?' (Answer: C5 root, C6 root, Suprascapular, Nerve to Subclavius, Anterior division, Posterior division)."
    },
    {
      id: 2,
      subject: 'Physiology',
      topic: 'Cardiovascular / Electrophysiology',
      question: "Describe the phases of the Ventricular Action Potential and their ion conductance.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Phase 0 (Rapid Depolarization):</strong> Influx of Na⁺ via fast voltage-gated Na⁺ channels.</li>
          <li><strong>Phase 1 (Early Partial Repolarization):</strong> Inactivation of fast Na⁺ channels + transient outward K⁺ efflux (I_to).</li>
          <li><strong>Phase 2 (Plateau):</strong> Influx of Ca²⁺ via L-type channels balanced by slow K⁺ efflux. Long refractory period prevents tetany!</li>
          <li><strong>Phase 3 (Rapid Repolarization):</strong> Inactivation of Ca²⁺ channels + delayed rectifier K⁺ channels open (I_Kr, I_Ks).</li>
          <li><strong>Phase 4 (Resting Potential):</strong> Maintained near -90 mV primarily by inward rectifier K⁺ channels (I_K1) and Na⁺/K⁺ ATPase.</li>
        </ul>
      `,
      vivaTip: "Remember to contrast this with SA nodal action potential, which has Phase 4 spontaneous diastolic depolarization (funny current I_f) and lacks Phase 1 & 2!"
    },
    {
      id: 3,
      subject: 'Biochemistry',
      topic: 'Carbohydrate Metabolism / Enzymes',
      question: "Which are the rate-limiting irreversible steps of Glycolysis, and how is PFK-1 regulated?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>3 Irreversible Steps:</strong>
            1. Hexokinase/Glucokinase (Glucose → G6P)<br>
            2. <strong>Phosphofructokinase-1 / PFK-1</strong> (F6P → F-1,6-BP) — <em>Committed pacemaker step!</em><br>
            3. Pyruvate Kinase (PEP → Pyruvate).
          </li>
          <li><strong>PFK-1 Activators:</strong> <strong>Fructose-2,6-bisphosphate (most potent)</strong>, AMP, ADP.</li>
          <li><strong>PFK-1 Inhibitors:</strong> ATP, Citrate, low intracellular pH (H⁺).</li>
          <li><strong>Hormonal control:</strong> Insulin stimulates PFK-2 to produce F-2,6-BP; Glucagon inhibits it via cAMP-PKA.</li>
        </ul>
      `,
      vivaTip: "Always mention that Glucokinase is present in liver and beta-islets with high Km (low affinity) and is NOT inhibited by G6P."
    },
    {
      id: 4,
      subject: 'Anatomy',
      topic: 'Head & Neck / Neuroanatomy',
      question: "What structures pass through the Cavernous Sinus, and what are its clinical communications?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Structures passing through the center (traversing):</strong> Internal Carotid Artery (ICA) and <strong>Abducent nerve (CN VI)</strong>.</li>
          <li><strong>Structures in the lateral wall (superior to inferior):</strong> Oculomotor (CN III), Trochlear (CN IV), Ophthalmic (CN V1), Maxillary (CN V2).</li>
          <li><strong>Danger area of face:</strong> Facial vein communicates with cavernous sinus via superior ophthalmic vein and deep facial vein (pterygoid plexus) — both are valveless.</li>
          <li><strong>Cavernous sinus thrombosis:</strong> First sign is usually Abducent nerve palsy (internal strabismus/inability to abduct eye) because CN VI lies freely in the sinus lumen!</li>
        </ul>
      `,
      vivaTip: "Mandibular nerve (CN V3) DOES NOT traverse or form part of the cavernous sinus wall (exits via Foramen Ovale)!"
    },
    {
      id: 5,
      subject: 'Physiology',
      topic: 'Respiratory Physiology',
      question: "What causes a right shift in the Oxygen-Hemoglobin Dissociation curve (Bohr Effect)?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Mnemonic for Right Shift:</strong> <strong>'CADET, face Right!'</strong></li>
          <li><strong>C:</strong> Increased CO₂ (hypercapnia)</li>
          <li><strong>A:</strong> Acidosis / Increased H⁺ / Decreased pH (Bohr Effect)</li>
          <li><strong>D:</strong> Increased 2,3-DPG (2,3-BPG)</li>
          <li><strong>E:</strong> Exercise</li>
          <li><strong>T:</strong> Increased Temperature</li>
          <li><strong>Physiological significance:</strong> Right shift decreases Hb-O₂ affinity, facilitating unloading of oxygen to actively respiring peripheral tissues!</li>
        </ul>
      `,
      vivaTip: "Fetal hemoglobin (HbF) shifts the curve to the LEFT because it has gamma chains that bind 2,3-DPG poorly, allowing it to extract O₂ from maternal blood."
    },
    {
      id: 6,
      subject: 'Biochemistry',
      topic: 'Lipid Metabolism',
      question: "Explain the Carnitine Shuttle in Fatty Acid Beta-Oxidation and its regulation.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Purpose:</strong> Long-chain fatty acyl-CoA cannot directly cross the inner mitochondrial membrane into the matrix.</li>
          <li><strong>Step 1:</strong> <strong>Carnitine Palmitoyltransferase-1 (CPT-1)</strong> on outer membrane transfers acyl group to carnitine, forming acylcarnitine.</li>
          <li><strong>Step 2:</strong> Carnitine-acylcarnitine translocase carries acylcarnitine across inner membrane.</li>
          <li><strong>Step 3:</strong> <strong>CPT-2</strong> in inner membrane regenerates fatty acyl-CoA and free carnitine.</li>
          <li><strong>Rate-limiting regulator:</strong> CPT-1 is strongly inhibited by <strong>Malonyl-CoA</strong> (the starting substrate of fatty acid synthesis), preventing simultaneous synthesis and breakdown!</li>
        </ul>
      `,
      vivaTip: "Deficiency of carnitine causes systemic hypoketotic hypoglycemia during fasting because the liver cannot oxidize fats to make ketones."
    },
    {
      id: 7,
      subject: 'Anatomy',
      topic: 'Lower Limb / Femoral Triangle',
      question: "What are the boundaries, contents, and clinical significance of the Femoral Triangle?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Boundaries:</strong> Superior: Inguinal ligament; Lateral: Medial border of Sartorius; Medial: Medial border of Adductor longus.</li>
          <li><strong>Contents (Lateral to Medial: NAVEL):</strong> Femoral <strong>N</strong>erve, Femoral <strong>A</strong>rtery, Femoral <strong>V</strong>ein, <strong>E</strong>mpty space (femoral canal), <strong>L</strong>acunar ligament / Lymph nodes (Cloquet).</li>
          <li><strong>Femoral Sheath:</strong> Encloses artery, vein, and canal, but <em>femoral nerve lies OUTSIDE the sheath</em>!</li>
          <li><strong>Clinical:</strong> Femoral artery catheterization for coronary angiography; Femoral hernia passes through femoral canal below and lateral to pubic tubercle.</li>
        </ul>
      `,
      vivaTip: "Always point out that the base of the femoral canal is the femoral ring, which is bounded medially by the sharp, crescentic lacunar ligament of Gimbernat."
    },
    {
      id: 8,
      subject: 'Physiology',
      topic: 'Renal / Concentration Mechanism',
      question: "Explain the Countercurrent Multiplier and Exchanger in the kidney.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Countercurrent Multiplier (Loop of Henle):</strong>
            - Descending limb: Highly permeable to H₂O, impermeable to NaCl. Fluid concentrates down to 1200 mOsm/L.<br>
            - Thick ascending limb: Active reabsorption of Na⁺/K⁺/2Cl⁻ (NKCC2), impermeable to H₂O. Creates the 200 mOsm/L horizontal gradient that gets multiplied vertically.
          </li>
          <li><strong>Countercurrent Exchanger (Vasa Recta):</strong> Passive hairpin capillary loops that supply oxygen/nutrients while preserving the medullary hyperosmolar gradient (prevents wash-out).</li>
          <li><strong>Role of Urea:</strong> Contributes ~50% of inner medullary osmolarity, recycled via UT-A1/UT-A3 under ADH stimulation.</li>
        </ul>
      `,
      vivaTip: "Loop diuretics like Furosemide act on the thick ascending limb NKCC2 cotransporter, completely destroying the medullary gradient."
    },
    {
      id: 9,
      subject: 'Biochemistry',
      topic: 'Amino Acid Metabolism / Urea Cycle',
      question: "What is the rate-limiting enzyme of the Urea Cycle, and what is the most common urea cycle defect?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Location:</strong> First 2 steps occur in the <strong>mitochondria</strong>; remaining 3 steps in the <strong>cytosol</strong> of hepatocytes.</li>
          <li><strong>Rate-limiting enzyme:</strong> <strong>Carbamoyl Phosphate Synthetase 1 (CPS-1)</strong>, which requires <strong>N-acetylglutamate (NAG)</strong> as an obligatory allosteric activator!</li>
          <li><strong>Nitrogen donors:</strong> One nitrogen comes from free ammonia (NH₄⁺), the other comes from <strong>Aspartate</strong>.</li>
          <li><strong>Most common defect:</strong> <strong>Ornithine Transcarbamylase (OTC) deficiency</strong> — X-linked recessive (others are autosomal recessive). Shows severe hyperammonemia with elevated urinary orotic acid.</li>
        </ul>
      `,
      vivaTip: "Contrast CPS-1 (mitochondrial, urea cycle, uses NH₄⁺) with CPS-2 (cytosolic, pyrimidine synthesis, uses Glutamine)."
    },
    {
      id: 10,
      subject: 'Anatomy',
      topic: 'Neuroanatomy / Brain Circulation',
      question: "What arteries constitute the Circle of Willis, and where do Berry Aneurysms most commonly rupture?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Arterial polygon components:</strong>
            - Anterior: Anterior communicating artery connecting both Anterior cerebral arteries (ACA).<br>
            - Lateral: Internal carotid arteries (ICA).<br>
            - Posterior: Posterior communicating arteries connecting ICA to Posterior cerebral arteries (PCA), which arise from the Basilar artery.
          </li>
          <li><strong>Berry Aneurysms:</strong> Congenital saccular aneurysms at arterial bifurcations due to deficiency in tunica media.</li>
          <li><strong>Most common site:</strong> <strong>Anterior Communicating Artery junction (~30–35%)</strong>, followed by Posterior Communicating Artery and MCA bifurcation.</li>
          <li><strong>Clinical:</strong> Rupture causes classic <em>Subarachnoid Hemorrhage (SAH)</em> with sudden 'worst headache of my life' (thunderclap headache) and xanthochromic CSF.</li>
        </ul>
      `,
      vivaTip: "Note that the Middle Cerebral Artery (MCA) is technically a direct terminal continuation of the ICA and is NOT considered a direct part of the ring polygon itself."
    },
    {
      id: 11,
      subject: 'Physiology',
      topic: 'Hematology & Blood Groups',
      question: "What is Erythroblastosis Fetalis (Hemolytic Disease of Newborn) and how is it prevented?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Condition:</strong> <strong>Rh-negative mother</strong> carrying an <strong>Rh-positive fetus</strong>.</li>
          <li><strong>Mechanism:</strong> First pregnancy is usually safe. During delivery, fetal Rh⁺ RBCs enter maternal circulation, sensitizing mother to produce anti-D antibodies.</li>
          <li><strong>Subsequent pregnancies:</strong> Maternal IgG anti-D antibodies cross placenta and destroy fetal Rh⁺ erythrocytes, causing severe anemia, jaundice, hydrops fetalis, and kernicterus.</li>
          <li><strong>Prevention:</strong> Administer <strong>anti-D immunoglobulin (RhoGAM)</strong> to Rh-negative mothers at 28 weeks gestation and within 72 hours of delivery of an Rh⁺ baby to destroy stray fetal RBCs before immune sensitization.</li>
        </ul>
      `,
      vivaTip: "Why is ABO incompatibility less severe than Rh? ABO antibodies (anti-A and anti-B) in group O mothers are mostly IgM (cannot cross placenta), and A/B antigens are also present on other tissues, diluting the effect."
    },
    {
      id: 12,
      subject: 'Biochemistry',
      topic: 'Vitamins & Cofactors',
      question: "Describe the absorption of Vitamin B12 and the biochemical basis of Megaloblastic Anemia.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Absorption:</strong> Dietary B12 binds R-binder in stomach → pancreatic proteases release B12 in duodenum → binds <strong>Intrinsic Factor (IF)</strong> secreted by gastric parietal cells → absorbed in <strong>terminal ileum</strong> via cubilin receptors.</li>
          <li><strong>Biochemical reactions requiring B12:</strong>
            1. Methionine synthase: Homocysteine → Methionine (transfers methyl from N5-methyl THF).<br>
            2. Methylmalonyl-CoA mutase: Methylmalonyl-CoA → Succinyl-CoA.
          </li>
          <li><strong>Folate Trap:</strong> In B12 deficiency, folate is trapped as N5-methyl THF, impairing thymidylate synthesis → defective DNA replication with normal RNA/protein synthesis = <strong>Megaloblastic Anemia</strong>!</li>
          <li><strong>Neurological signs:</strong> Subacute Combined Degeneration of Cord (SCD) due to accumulation of methylmalonic acid in myelin sheath.</li>
        </ul>
      `,
      vivaTip: "Giving high-dose folic acid alone in B12 deficiency can fix the anemia but will WORSEN the irreversible neurological damage!"
    },
    {
      id: 13,
      subject: 'Anatomy',
      topic: 'Upper Limb / Forearm & Hand',
      question: "What structures pass through the Carpal Tunnel, and what are the manifestations of Carpal Tunnel Syndrome?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Boundary:</strong> Formed anteriorly by the <strong>Flexor Retinaculum</strong> and posteriorly by the carpal bones.</li>
          <li><strong>10 Structures inside:</strong> <strong>Median nerve</strong> + 9 tendons (4 FDS, 4 FDP, 1 FPL).</li>
          <li><strong>Symptoms:</strong> Pain, tingling, numbness in lateral 3½ digits; thenar muscle wasting (ape-thumb deformity); weakness of abductor pollicis brevis.</li>
          <li><strong>Sensory preservation:</strong> <em>Sensation over thenar eminence is SPARED</em> because the Palmar Cutaneous Branch of the Median nerve passes superficial to the flexor retinaculum!</li>
          <li><strong>Clinical tests:</strong> <strong>Phalen's test</strong> (forced wrist flexion for 60s reproduces tingling) and <strong>Tinel's sign</strong> (tapping over flexor retinaculum).</li>
        </ul>
      `,
      vivaTip: "Flexor carpi radialis (FCR) does NOT pass through the main carpal tunnel — it runs in its own separate compartment within the lateral split of the flexor retinaculum."
    },
    {
      id: 14,
      subject: 'Physiology',
      topic: 'Endocrine / Thyroid Gland',
      question: "Enumerate the steps of Thyroid Hormone Synthesis and describe the Wolff-Chaikoff effect.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Steps:</strong>
            1. <strong>Iodide Trapping:</strong> Na⁺/I⁻ symporter (NIS) against gradient.<br>
            2. <strong>Oxidation:</strong> I⁻ oxidized to active iodine by <strong>Thyroid Peroxidase (TPO)</strong>.<br>
            3. <strong>Organification:</strong> Tyrosyl residues of thyroglobulin iodinated to MIT and DIT.<br>
            4. <strong>Coupling:</strong> MIT + DIT → T3; DIT + DIT → T4.<br>
            5. <strong>Endocytosis & Cleavage:</strong> Lysosomal proteases release free T3/T4 into circulation.
          </li>
          <li><strong>Wolff-Chaikoff Effect:</strong> High doses of ingested inorganic iodide temporarily inhibit thyroid hormone synthesis (organification/TPO), acting as a physiological defense mechanism!</li>
        </ul>
      `,
      vivaTip: "Propylthiouracil (PTU) inhibits both TPO in the thyroid AND peripheral 5'-deiodinase (conversion of T4 to T3), whereas Methimazole only inhibits TPO."
    },
    {
      id: 15,
      subject: 'Biochemistry',
      topic: 'Inborn Errors of Metabolism',
      question: "What is Phenylketonuria (PKU)? Describe its biochemical defect, manifestations, and management.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Enzyme defect:</strong> Deficiency of <strong>Phenylalanine Hydroxylase (PAH)</strong> (Classic PKU) or rarely <strong>Tetrahydrobiopterin (BH4)</strong> cofactor deficiency.</li>
          <li><strong>Biochemical:</strong> Phenylalanine cannot convert to Tyrosine. High phenylalanine diverts to phenylpyruvate, phenyllactate, and phenylacetate.</li>
          <li><strong>Clinical findings:</strong> Severe intellectual disability, microcephaly, seizures, hypopigmentation (blonde hair, blue eyes due to melanin lack), and characteristic <strong>musty or mousy body odor</strong>.</li>
          <li><strong>Management:</strong> Newborn screening (Guthrie test), low-phenylalanine diet (avoid aspartame!), and essential <strong>Tyrosine supplementation</strong>.</li>
        </ul>
      `,
      vivaTip: "Tyrosine becomes an essential amino acid in patients with PKU!"
    },
    {
      id: 16,
      subject: 'Anatomy',
      topic: 'Thorax / Cardiology',
      question: "Explain Coronary Dominance and the blood supply of the Cardiac Conducting System.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Coronary Dominance:</strong> Determined by which artery gives origin to the <strong>Posterior Interventricular Artery (PDA)</strong>:
            - Right Dominant (~70–80%): PDA arises from Right Coronary Artery (RCA).<br>
            - Left Dominant (~10–12%): PDA arises from Circumflex branch of LCA.<br>
            - Codominant (~10%): PDA arises from both RCA and Circumflex.
          </li>
          <li><strong>SA Node supply:</strong> RCA in 60% of individuals, Circumflex LCA in 40%.</li>
          <li><strong>AV Node supply:</strong> RCA (via nodal branch at crux) in ~80–90% of individuals.</li>
          <li><strong>AV Bundle of His:</strong> Supplied predominantly by the Left Anterior Descending (LAD) septal branches.</li>
        </ul>
      `,
      vivaTip: "The LAD artery is known as the 'widow-maker' because it supplies 45–55% of the left ventricle including the anterior 2/3 of the interventricular septum."
    },
    {
      id: 17,
      subject: 'Physiology',
      topic: 'Nerve-Muscle Physiology',
      question: "Explain the pathogenesis of Myasthenia Gravis and how it differs from Lambert-Eaton Syndrome.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Myasthenia Gravis:</strong> Autoantibodies against <strong>postsynaptic Nicotinic Acetylcholine Receptors (AChR)</strong> at the neuromuscular junction.
            - Manifestation: Muscle weakness that <em>worsens with repeated use / fatigue</em> (ptosis, diplopia, difficulty swallowing).<br>
            - Diagnostic: Tensilon test (Edrophonium) shows immediate improvement; decremental response on repetitive nerve stimulation.
          </li>
          <li><strong>Lambert-Eaton Myasthenic Syndrome (LEMS):</strong> Autoantibodies against <strong>presynaptic Voltage-Gated Calcium Channels (VGCC)</strong>, preventing ACh release.
            - Characteristic: Weakness <em>improves with repeated muscle contraction</em> (incremental response); strongly associated with Small Cell Lung Cancer!
          </li>
        </ul>
      `,
      vivaTip: "75% of Myasthenia Gravis patients have thymic abnormalities (thymic hyperplasia or thymoma), and thymectomy often leads to clinical remission."
    },
    {
      id: 18,
      subject: 'Biochemistry',
      topic: 'Molecular Biology / Diagnostics',
      question: "What are the steps of PCR (Polymerase Chain Reaction) and the essentials of each step?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Principle:</strong> In vitro exponential amplification of a specific target DNA sequence.</li>
          <li><strong>Step 1: Denaturation (94–96°C for 30s):</strong> Breaks hydrogen bonds between complementary strands to yield single-stranded DNA.</li>
          <li><strong>Step 2: Annealing (50–65°C for 30s):</strong> Forward and reverse synthetic oligonucleotide primers bind specifically to flanking target sequences.</li>
          <li><strong>Step 3: Extension / Elongation (72°C):</strong> <strong>Taq Polymerase</strong> (thermostable DNA polymerase from <em>Thermus aquaticus</em>) synthesizes complementary strand from dNTPs in 5' → 3' direction.</li>
          <li><strong>Cycle math:</strong> 2ⁿ copies after n cycles (e.g., 30 cycles yield ~1 billion copies).</li>
        </ul>
      `,
      vivaTip: "Why does Taq Polymerase need Mg²⁺? Mg²⁺ is an obligatory divalent cofactor that stabilizes enzyme-substrate interactions and coordinates dNTP phosphate groups."
    },
    {
      id: 19,
      subject: 'Anatomy',
      topic: 'Embryology / Pharyngeal Apparatus',
      question: "List the nerve, skeletal, and muscular derivatives of the 1st and 2nd Pharyngeal Arches.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>1st Arch (Mandibular Arch):</strong>
            - Nerve: <strong>Mandibular nerve (CN V3)</strong>.<br>
            - Muscles: Muscles of mastication (masseter, temporalis, medial & lateral pterygoids), mylohyoid, anterior belly of digastric, tensor tympani, tensor veli palatini.<br>
            - Skeletal/Cartilage: Meckel's cartilage → Malleus, Incus, anterior ligament of malleus, sphenomandibular ligament.
          </li>
          <li><strong>2nd Arch (Hyoid Arch):</strong>
            - Nerve: <strong>Facial nerve (CN VII)</strong>.<br>
            - Muscles: Muscles of facial expression, stapedius, stylohyoid, posterior belly of digastric.<br>
            - Skeletal/Cartilage: Reichert's cartilage → Stapes, styloid process, stylohyoid ligament, lesser cornu and upper body of hyoid bone.
          </li>
        </ul>
      `,
      vivaTip: "Notice how Digastric muscle has dual nerve supply: Anterior belly from 1st arch (CN V3), Posterior belly from 2nd arch (CN VII)!"
    },
    {
      id: 20,
      subject: 'Physiology',
      topic: 'Endocrine / Adrenal Cortex',
      question: "How do you clinically and biochemically differentiate Cushing's Disease from Cushing's Syndrome?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Cushing's Syndrome:</strong> Umbrella term for hypercortisolism of ANY etiology (exogenous steroids, adrenal adenoma, ectopic ACTH, or pituitary).</li>
          <li><strong>Cushing's Disease:</strong> Specific subtype (~70% of endogenous cases) caused by an <strong>ACTH-secreting Pituitary Adenoma</strong>.</li>
          <li><strong>High-Dose Dexamethasone Suppression Test (HDDST):</strong>
            - Cushing's Disease: Cortisol suppresses by >50% because pituitary adenoma retains partial negative feedback.<br>
            - Ectopic ACTH (e.g. Small cell lung ca) & Adrenal Tumor: No suppression!
          </li>
          <li><strong>Serum ACTH:</strong> Low in primary adrenal adenoma; High in Cushing's disease and ectopic ACTH.</li>
        </ul>
      `,
      vivaTip: "Always check for hyperpigmentation: it is present in ACTH-dependent causes (pituitary/ectopic) because pro-opiomelanocortin (POMC) cleavage produces alpha-MSH!"
    },
    {
      id: 21,
      subject: 'Biochemistry',
      topic: 'Clinical Biochemistry / Diabetes',
      question: "Explain the biochemical pathogenesis of Diabetic Ketoacidosis (DKA) and the Anion Gap calculation.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Pathogenesis:</strong> Severe absolute Insulin deficiency + Glucagon excess activates Hormone-Sensitive Lipase (HSL) in adipocytes → massive release of free fatty acids into liver.</li>
          <li><strong>Ketogenesis:</strong> Beta-oxidation produces excess Acetyl-CoA that overwhelms TCA cycle → diverted into ketogenesis: <strong>Acetoacetate, Beta-hydroxybutyrate, and Acetone</strong>.</li>
          <li><strong>Serum Anion Gap:</strong> Formula = <strong>[Na⁺] - ([Cl⁻] + [HCO₃⁻])</strong>. Normal = 8–12 mEq/L.</li>
          <li><strong>In DKA:</strong> High Anion Gap Metabolic Acidosis (>12 mEq/L) because unmeasured ketoacid anions replace bicarbonate.</li>
          <li><strong>Kussmaul breathing:</strong> Deep, rapid respirations as respiratory compensation to blow off CO₂.</li>
        </ul>
      `,
      vivaTip: "Nitroprusside urine dipstick test detects Acetoacetate but DOES NOT detect Beta-hydroxybutyrate, which is the predominant ketone body in severe DKA!"
    },
    {
      id: 22,
      subject: 'Anatomy',
      topic: 'Histology / Epithelia & Glands',
      question: "Classify the types of Epithelium with characteristic high-yield body locations for each.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Simple Squamous:</strong> Endothelium (blood vessels), Mesothelium (pericardium/pleura), Alveoli of lungs, Bowman's capsule parietal layer.</li>
          <li><strong>Simple Cuboidal:</strong> Renal tubules (PCT/DCT), Thyroid follicular cells, Germinal epithelium of ovary.</li>
          <li><strong>Simple Columnar:</strong> Stomach, intestine, gallbladder (often with microvilli/brush border); Fallopian tubes & uterus (ciliated).</li>
          <li><strong>Pseudostratified Ciliated Columnar:</strong> Respiratory tract (trachea, bronchi), olfactory mucosa.</li>
          <li><strong>Stratified Squamous Keratinized:</strong> Epidermis of skin.</li>
          <li><strong>Stratified Squamous Non-Keratinized:</strong> Oral cavity, esophagus, vagina, anal canal (above white line), cornea.</li>
          <li><strong>Transitional (Urothelium):</strong> Renal pelvis, ureter, urinary bladder, proximal urethra (umbrella cells capable of stretching).</li>
        </ul>
      `,
      vivaTip: "Examiners love asking about the histology of the Gastro-Esophageal junction: abrupt transition from Stratified Squamous Non-Keratinized to Simple Columnar (Z-line)!"
    },
    {
      id: 23,
      subject: 'Physiology',
      topic: 'Cardiovascular / Blood Pressure Regulation',
      question: "Describe the Baroreceptor Reflex and its role in maintaining postural blood pressure.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Sensors:</strong> Spray-type stretch receptors in <strong>Carotid Sinus (innervated by CN IX / Hering's nerve)</strong> and <strong>Aortic Arch (innervated by CN X)</strong>.</li>
          <li><strong>Afferent relay:</strong> Terminate in the <strong>Nucleus Tractus Solitarius (NTS)</strong> in the medulla.</li>
          <li><strong>When standing up (Orthostasis):</strong> Gravity pools 500–800 mL blood in lower limbs → decreased venous return → decreased stroke volume & MAP → <strong>decreased baroreceptor firing</strong>.</li>
          <li><strong>Compensatory reflex:</strong> NTS releases inhibition on rostral ventrolateral medulla (RVLM) → surge of sympathetic discharge: vasoconstriction (increased TPR) + tachycardia and increased inotropy.</li>
          <li><strong>Failure:</strong> Leads to <em>Orthostatic (postural) Hypotension</em> (drop in SBP >20 mmHg or DBP >10 mmHg).</li>
        </ul>
      `,
      vivaTip: "Carotid sinus responds to both increases and decreases in blood pressure, whereas Aortic arch receptors respond primarily to increases in pressure!"
    },
    {
      id: 24,
      subject: 'Biochemistry',
      topic: 'Vitamins & Collagen',
      question: "What is the biochemical role of Vitamin C (Ascorbic Acid) in Collagen biosynthesis, and how does Scurvy develop?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Role in Hydroxylation:</strong> Vitamin C acts as a reducing agent to keep iron in the active <strong>ferrous (Fe²⁺) state</strong> for the enzymes <strong>Prolyl Hydroxylase</strong> and <strong>Lysyl Hydroxylase</strong>.</li>
          <li><strong>Why hydroxylation matters:</strong> Hydroxyproline residues are essential for interchain hydrogen bonds that stabilize the collagen triple helix. Hydroxylysine is needed for covalent cross-linking!</li>
          <li><strong>Scurvy manifestations:</strong> Defective, unhydroxylated procollagen cannot form stable cross-linked fibrils:
            - Capillary fragility: Perifollicular hemorrhages, easy bruising, petechiae.<br>
            - Gingival changes: Swollen, bleeding, spongy gums.<br>
            - Skeletal/Healing: Poor wound healing, corkscrew hair, subperiosteal hematomas in infants.
          </li>
        </ul>
      `,
      vivaTip: "Collagen is the most abundant protein in the human body, characterized by the repeating triplet sequence (Gly-X-Y), where every third amino acid is Glycine!"
    },
    {
      id: 25,
      subject: 'Anatomy',
      topic: 'Abdomen & Pelvis / Inguinal Canal',
      question: "What are the boundaries, contents, and differences between Direct and Indirect Inguinal Hernia?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Inguinal Canal Dimensions:</strong> ~4 cm oblique passage above medial half of inguinal ligament.</li>
          <li><strong>Walls:</strong> Anterior: External oblique aponeurosis (+ internal oblique laterally); Posterior: Fascia transversalis (+ conjoint tendon medially); Roof: Arching fibers of internal oblique and transversus abdominis; Floor: Inguinal and lacunar ligaments.</li>
          <li><strong>Indirect Hernia:</strong> Passes through <strong>deep inguinal ring LATERAL to inferior epigastric vessels</strong> into canal; congenital persistent processus vaginalis; frequently enters scrotum.</li>
          <li><strong>Direct Hernia:</strong> Pushes straight through the posterior wall via <strong>Hesselbach's Triangle MEDIAL to inferior epigastric vessels</strong>; acquired weakness in older males; rarely enters scrotum.</li>
        </ul>
      `,
      vivaTip: "Boundaries of Hesselbach's Triangle: Medial: Lateral border of Rectus abdominis; Lateral: Inferior epigastric vessels; Inferior: Inguinal ligament."
    },
    {
      id: 26,
      subject: 'Physiology',
      topic: 'Cardiovascular / Heart Sounds & Murmurs',
      question: "What causes the First (S1) and Second (S2) Heart Sounds, and what is Physiological Splitting of S2?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>S1 ('Lub'):</strong> Caused by closure of atrioventricular valves (<strong>Mitral and Tricuspid</strong>) at onset of ventricular systole. Lower pitch, longer duration.</li>
          <li><strong>S2 ('Dub'):</strong> Caused by closure of semilunar valves (<strong>Aortic [A2] and Pulmonary [P2]</strong>) at onset of ventricular diastole. Higher pitch, sharp.</li>
          <li><strong>Physiological Splitting of S2:</strong> During <strong>inspiration</strong>:
            - Increased negative intrathoracic pressure increases venous return to right ventricle → prolongs RV ejection time → delays P2.<br>
            - Concurrently, pulmonary vascular capacitance increases, slightly decreasing left atrial return → A2 occurs slightly earlier.<br>
            - Result: A2 and P2 separate audible split during inspiration and fuse on expiration.
          </li>
          <li><strong>Fixed split S2:</strong> Pathognomonic of <strong>Atrial Septal Defect (ASD)</strong>!</li>
        </ul>
      `,
      vivaTip: "Third heart sound (S3) is normal in healthy children and athletes, but in adults over 40 indicates ventricular dilation/heart failure (volume overload)."
    },
    {
      id: 27,
      subject: 'Biochemistry',
      topic: 'Lipid Transport & Lipoproteins',
      question: "Classify Lipoproteins and explain Reverse Cholesterol Transport by HDL.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Classification by Density:</strong> Chylomicrons < VLDL < IDL < LDL < HDL.</li>
          <li><strong>Key Apoproteins:</strong>
            - <strong>ApoB-48:</strong> Chylomicrons (dietary fat transport from intestine).<br>
            - <strong>ApoB-100:</strong> VLDL, IDL, LDL (ligand for LDL receptor).<br>
            - <strong>ApoA-1:</strong> HDL (activates LCAT).<br>
            - <strong>ApoC-II:</strong> Activates Lipoprotein Lipase (LPL).<br>
            - <strong>ApoE:</strong> Mediates remnant reuptake by liver.
          </li>
          <li><strong>Reverse Cholesterol Transport:</strong>
            - Nascent HDL extracts free cholesterol from peripheral cells via <strong>ABCA1/ABCG1</strong> transporter.<br>
            - <strong>LCAT (Lecithin-Cholesterol Acyltransferase)</strong> esterifies cholesterol, trapping it in HDL core.<br>
            - Mature HDL returns cholesterol to liver via <strong>SR-B1</strong> receptor for biliary excretion or conversion to bile acids!
          </li>
        </ul>
      `,
      vivaTip: "High levels of LDL ('bad cholesterol') are atherogenic because oxidized LDL is engulfed by macrophages to form foam cells in atherosclerotic plaques."
    },
    {
      id: 28,
      subject: 'Anatomy',
      topic: 'Upper Limb / Spaces & Fossa',
      question: "What are the boundaries and contents of the Cubital Fossa?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Boundaries:</strong>
            - Superior: Imaginary horizontal line connecting medial and lateral humeral epicondyles.<br>
            - Medial: Lateral border of Pronator teres.<br>
            - Lateral: Medial border of Brachioradialis.<br>
            - Floor: Brachialis and Supinator muscles.<br>
            - Roof: Skin, superficial fascia, bicipital aponeurosis (protects brachial artery during venipuncture!).
          </li>
          <li><strong>Contents (Medial to Lateral: MBBR):</strong>
            1. <strong>M</strong>edian nerve.<br>
            2. <strong>B</strong>rachial artery (bifurcates into radial and ulnar arteries at neck of radius).<br>
            3. <strong>B</strong>iceps brachii tendon.<br>
            4. <strong>R</strong>adial nerve (deep and superficial branches).
          </li>
        </ul>
      `,
      vivaTip: "Median cubital vein in the roof is the most preferred site for venipuncture and intravenous injections because it is tethered to the deep fascia and does not slip easily."
    },
    {
      id: 29,
      subject: 'Physiology',
      topic: 'Respiratory / Lung Surfactant',
      question: "What is Pulmonary Surfactant, which cells produce it, and what is its role in Infant Respiratory Distress Syndrome (IRDS)?",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Producer:</strong> Secreted by <strong>Type II Alveolar Pneumocytes</strong> starting around 24–28 weeks gestation (matures by 35 weeks).</li>
          <li><strong>Composition:</strong> ~90% lipids (predominantly <strong>Dipalmitoylphosphatidylcholine / DPPC</strong>) + 10% surfactant proteins (SP-A, B, C, D).</li>
          <li><strong>Mechanism (Law of Laplace, P = 2T/r):</strong> Reduces surface tension at air-liquid interface proportionally more in smaller alveoli, preventing alveolar collapse on expiration (atelectasis) and equalizing pressure between unequal alveoli!</li>
          <li><strong>IRDS (Hyaline Membrane Disease):</strong> Premature infants born before 34 weeks lack sufficient surfactant → massive alveolar collapse, hypoxemia, respiratory acidosis.</li>
          <li><strong>Assessment:</strong> Amniotic fluid <strong>Lecithin/Sphingomyelin (L/S) ratio > 2.0</strong> signifies fetal lung maturity. Prenatal maternal corticosteroids (Dexamethasone) accelerate surfactant production.</li>
        </ul>
      `,
      vivaTip: "Surfactant also keeps alveoli dry by reducing inward hydrostatic suction of fluid from pulmonary capillaries, preventing pulmonary edema."
    },
    {
      id: 30,
      subject: 'Biochemistry',
      topic: 'Bioenergetics & Electron Transport Chain',
      question: "Name the complexes of the Mitochondrial Electron Transport Chain and their classic inhibitors.",
      pearl: `
        <p class="font-bold text-slate-800 dark:text-slate-200 mb-1">Key Viva Points:</p>
        <ul class="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
          <li><strong>Complex I (NADH-Q Oxidoreductase):</strong> Inhibited by <strong>Rotenone</strong> and Amytal.</li>
          <li><strong>Complex II (Succinate-Q Reductase):</strong> Contains FAD, only enzyme shared with TCA cycle (Succinate Dehydrogenase). Inhibited by Malonate.</li>
          <li><strong>Complex III (Q-Cytochrome c Oxidoreductase):</strong> Inhibited by <strong>Antimycin A</strong>.</li>
          <li><strong>Complex IV (Cytochrome c Oxidase):</strong> Contains copper (CuA, CuB) and hemes (a, a3). Inhibited by <strong>Cyanide (CN⁻), Carbon Monoxide (CO), and Azide</strong>.</li>
          <li><strong>Complex V (ATP Synthase):</strong> Inhibited by <strong>Oligomycin</strong>.</li>
          <li><strong>Uncouplers:</strong> <strong>2,4-Dinitrophenol (DNP)</strong> and <strong>Thermogenin (UCP-1 in brown fat)</strong> increase inner membrane permeability to protons, dissipating the proton gradient as HEAT without ATP synthesis.</li>
        </ul>
      `,
      vivaTip: "Complex II is the only complex in the electron transport chain that does NOT pump protons across the inner mitochondrial membrane into the intermembrane space!"
    }
  ];

  // Helper to determine day of the year
  function getTodayVivaQuestion() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = Math.abs(dayOfYear) % VIVA_QUESTIONS.length;
    return {
      question: VIVA_QUESTIONS[index],
      dayOfYear,
      index
    };
  }

  // Toggle reveal answer state
  let isAnswerVisible = false;

  function toggleVivaAnswer() {
    isAnswerVisible = !isAnswerVisible;
    const answerBox = document.getElementById('viva-pearl-box');
    const toggleBtn = document.getElementById('viva-toggle-btn');
    if (!answerBox || !toggleBtn) return;

    if (isAnswerVisible) {
      answerBox.classList.remove('hidden');
      toggleBtn.innerHTML = `
        <i data-lucide="eye-off" class="w-3.5 h-3.5"></i>
        <span>Hide High-Yield Pearl</span>
      `;
    } else {
      answerBox.classList.add('hidden');
      toggleBtn.innerHTML = `
        <i data-lucide="lightbulb" class="w-3.5 h-3.5"></i>
        <span>Show High-Yield Viva Pearl</span>
      `;
    }
    if (window.lucide && window.lucide.createIcons) lucide.createIcons();
  }

  // Toggle widget minimize/expand
  function toggleVivaWidgetMinimize() {
    const isMinimized = localStorage.getItem('mtmc_viva_minimized') === 'true';
    const nextState = !isMinimized;
    localStorage.setItem('mtmc_viva_minimized', nextState ? 'true' : 'false');
    renderDailyVivaWidget();
  }

  // Open discussion thread in post modal pre-filled
  function discussDailyViva() {
    const item = getTodayVivaQuestion().question;
    if (typeof openNewPostWithPrefill === 'function') {
      openNewPostWithPrefill({
        board: 'academics',
        tag: '🩺 Viva Tip',
        title: `[Viva Recall] ${item.subject}: ${item.topic}`,
        content: `**Daily 1st MBBS Viva Question:**\n${item.question}\n\n**Batchmates Discussion:**\nWhat mnemonics, clinical notes, or professor viva traps do you remember for this topic? Share below!`
      });
    } else if (typeof handleNewPostClick === 'function') {
      handleNewPostClick();
    }
  }

  // Render the widget in the DOM
  function renderDailyVivaWidget() {
    const container = document.getElementById('daily-viva-container');
    if (!container) return;

    // Only display on 'all' or 'academics' board, and not in active thread detail
    if (typeof activeThreadId !== 'undefined' && activeThreadId) {
      container.innerHTML = '';
      container.classList.add('hidden');
      return;
    }
    if (typeof activeBoard !== 'undefined' && activeBoard !== 'all' && activeBoard !== 'academics') {
      container.innerHTML = '';
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');

    const { question, dayOfYear } = getTodayVivaQuestion();
    const isMinimized = localStorage.getItem('mtmc_viva_minimized') === 'true';

    // Subject badge style
    let subjectBadgeClass = 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30';
    if (question.subject === 'Physiology') {
      subjectBadgeClass = 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30';
    } else if (question.subject === 'Biochemistry') {
      subjectBadgeClass = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
    }

    // Minimized View
    if (isMinimized) {
      container.innerHTML = `
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3 shadow-xs transition-colors flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 truncate">
            <span class="w-6 h-6 rounded bg-brand-orange/15 text-brand-orange flex items-center justify-center text-xs font-bold shrink-0">
              🩺
            </span>
            <span class="font-bold text-slate-800 dark:text-slate-200 truncate">Question of the Day:</span>
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded ${subjectBadgeClass} shrink-0">${question.subject}</span>
            <span class="text-slate-600 dark:text-slate-400 truncate hidden sm:inline">${escapeHtml(question.topic)}</span>
          </div>
          <button type="button" onclick="toggleVivaWidgetMinimize()" class="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition shrink-0 flex items-center gap-1">
            <span>Expand</span>
            <i data-lucide="chevron-down" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
      if (window.lucide && window.lucide.createIcons) lucide.createIcons();
      return;
    }

    // Full Expanded View
    container.innerHTML = `
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 sm:p-5 shadow-xs transition-colors space-y-3.5">
        <!-- Top Metadata Row -->
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded bg-brand-orange/15 text-brand-orange border border-brand-orange/30 flex items-center justify-center font-bold text-xs">
              🩺
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <h4 class="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">Question of the Day</h4>
                <span class="text-[9px] font-black px-1.5 py-0.2 rounded bg-brand-orange text-white uppercase tracking-wider">Daily Viva</span>
              </div>
              <p class="text-[10px] text-slate-400">1st MBBS High-Yield Practical Recall</p>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded ${subjectBadgeClass}">
              ${question.subject}
            </span>
            <button type="button" onclick="toggleVivaWidgetMinimize()" class="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition" title="Minimize Widget">
              <i data-lucide="chevron-up" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        <!-- Question Area -->
        <div class="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-md border border-slate-200 dark:border-slate-800/80 space-y-1.5">
          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            Topic: ${escapeHtml(question.topic)}
          </div>
          <p class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-relaxed">
            "${escapeHtml(question.question)}"
          </p>
        </div>

        <!-- Collapsible Pearl / Answer Box -->
        <div id="viva-pearl-box" class="${isAnswerVisible ? '' : 'hidden'} p-3.5 rounded-md bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/25 space-y-2 text-xs text-slate-700 dark:text-slate-300 transition-all">
          <div class="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>Examiner's Preferred Pearl:</span>
          </div>
          <div class="text-xs text-slate-800 dark:text-slate-200">
            ${question.pearl}
          </div>
          ${question.vivaTip ? `
            <div class="pt-2 border-t border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 italic flex items-start gap-1.5">
              <span class="font-bold not-italic">⚡ Viva Trap:</span>
              <span>${escapeHtml(question.vivaTip)}</span>
            </div>
          ` : ''}
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between pt-1 gap-2 flex-wrap text-xs">
          <button type="button" id="viva-toggle-btn" onclick="toggleVivaAnswer()" class="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1.5">
            <i data-lucide="${isAnswerVisible ? 'eye-off' : 'lightbulb'}" class="w-3.5 h-3.5"></i>
            <span>${isAnswerVisible ? 'Hide High-Yield Pearl' : 'Show High-Yield Viva Pearl'}</span>
          </button>

          <button type="button" onclick="discussDailyViva()" class="px-3 py-1.5 rounded bg-brand-orange hover:bg-brand-orangeHover text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs">
            <i data-lucide="message-square" class="w-3.5 h-3.5"></i>
            <span>Discuss in Academics</span>
          </button>
        </div>
      </div>
    `;

    if (window.lucide && window.lucide.createIcons) lucide.createIcons();
  }

  // Expose to window
  window.VIVA_QUESTIONS = VIVA_QUESTIONS;
  window.renderDailyVivaWidget = renderDailyVivaWidget;
  window.toggleVivaAnswer = toggleVivaAnswer;
  window.toggleVivaWidgetMinimize = toggleVivaWidgetMinimize;
  window.discussDailyViva = discussDailyViva;
})();
