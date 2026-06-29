import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Do I need prior coding experience?',
    a: 'Our beginner-level bootcamps (like AI Product Design) require no coding background. Intermediate and advanced bootcamps expect basic familiarity with programming concepts. Each listing clearly states the required level.',
  },
  {
    q: 'What is the time commitment per week?',
    a: 'Expect 15-20 hours per week for live sessions, assignments, and project work. We also recommend 2-3 hours of self-study. We design the schedule to be intense but achievable alongside a part-time job.',
  },
  {
    q: 'How does the AI agent loop work in the curriculum?',
    a: 'Throughout each bootcamp, AI agents act as your coding assistants, research partners, and learning guides. You learn to prompt, iterate, and collaborate with AI to build real products — the same workflow used in modern engineering teams.',
  },
  {
    q: 'Do you offer EMI or installment plans?',
    a: 'Yes! We partner with leading Indian fintech companies to offer no-cost EMI options for up to 12 months. You can also pay in 2-3 installments spread across the bootcamp duration.',
  },
  {
    q: 'What happens if I miss a live session?',
    a: 'All live sessions are recorded and available within 2 hours. You also get access to the class chat, assignments, and can attend makeup sessions with the next batch for that module.',
  },
  {
    q: 'Do you guarantee job placement?',
    a: 'We don\'t guarantee placement, but we provide extensive career support: resume reviews, portfolio coaching, mock interviews, and introductions to our 120+ hiring partners. 89% of our Guided plan graduates land roles within 3 months.',
  },
  {
    q: 'Can I switch bootcamps after enrolling?',
    a: 'Yes, within the first 2 weeks you can switch to another bootcamp at no extra cost, subject to availability. After 2 weeks, we offer a prorated credit toward a future bootcamp.',
  },
  {
    q: 'Are the certificates recognized by employers?',
    a: 'Our certificates are verified on the blockchain and recognized by all our hiring partners. While no certificate replaces hands-on experience, ours is backed by real project work that employers value.',
  },
];

const FAQItem: React.FC<{ q: string; a: string; isOpen: boolean; onClick: () => void }> = ({
  q,
  a,
  isOpen,
  onClick,
}) => (
  <div className="border-b border-slate-200 last:border-0">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-5 text-left group"
    >
      <span className="text-lg font-medium text-slate-800 group-hover:text-brand-600 transition-colors">
        {q}
      </span>
      <ChevronDown
        size={20}
        className={`text-slate-400 shrink-0 ml-4 transition-transform duration-200 ${
          isOpen ? 'rotate-180 text-brand-600' : ''
        }`}
      />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <p className="pb-5 text-slate-500 leading-relaxed">{a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3"
          >
            FAQ
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-heading"
          >
            Frequently asked questions
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-sm"
        >
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              q={faq.q}
              a={faq.a}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
