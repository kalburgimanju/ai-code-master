import { useState } from 'react'
import { useContacts } from '../hooks/useApi'
import { Users, Mail, ExternalLink, Star } from 'lucide-react'

export function Contacts() {
  const [page, setPage] = useState(0)
  const limit = 20

  const { data, isLoading } = useContacts({ limit, offset: page * limit })
  const contacts = data?.contacts ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
        <p className="text-gray-500 dark:text-dark-400 mt-1">
          {total} contacts across all companies
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : contacts.length > 0 ? (
        <>
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Engagement</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase">Emails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700 dark:text-primary-400">
                            {contact.first_name[0]}{contact.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{contact.full_name}</p>
                            {contact.is_decision_maker && (
                              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          {contact.linkedin_url && (
                            <a
                              href={contact.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-400 hover:text-primary-600 flex items-center gap-1"
                            >
                              LinkedIn
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 dark:text-white">{contact.title}</p>
                      {contact.seniority && (
                        <p className="text-xs text-gray-400 dark:text-dark-500 capitalize">{contact.seniority}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-dark-500">No email</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${Math.min(contact.engagement_score * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-dark-400">
                          {(contact.engagement_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-dark-400">
                      {contact.emails_sent} sent / {contact.emails_replied} replied
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-dark-400">
                Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn-secondary text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-secondary text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 dark:text-dark-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No contacts yet</h3>
          <p className="text-gray-500 dark:text-dark-400">
            Run a research agent to find decision makers at companies
          </p>
        </div>
      )}
    </div>
  )
}
