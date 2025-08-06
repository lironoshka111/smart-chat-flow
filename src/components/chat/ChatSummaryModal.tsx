import { Dialog, Transition } from "@headlessui/react";
import type { ChatMessage } from "../../types/chat";
import { Fragment } from "react";

interface ChatSummaryModalProps {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  answers: Record<string, string>;
}

export const ChatSummaryModal = ({
  open,
  onClose,
  messages,
  answers,
}: ChatSummaryModalProps) => (
  <Transition show={open} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black bg-opacity-25" />
      </Transition>

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-2xl max-h-[90vh] transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all flex flex-col">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900 p-6 pb-4 border-b border-gray-200"
              >
                Chat Summary
              </Dialog.Title>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {messages
                    .filter(
                      (msg) => msg.type === "input" || msg.type === "action",
                    )
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="font-medium text-gray-900 mb-2">
                          {msg.content}
                        </div>
                        {answers[msg.id] && (
                          <div className="text-gray-700 bg-white px-3 py-2 rounded border">
                            {answers[msg.id]}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
              <div className="p-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </Transition>
        </div>
      </div>
    </Dialog>
  </Transition>
);
