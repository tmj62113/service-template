import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getApiUrl } from "../config/api";

export default function AdminMessages() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [messageThread, setMessageThread] = useState([]);
  const itemsPerPage = 5;

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
      fetchCustomers();
    }
  }, [isAuthenticated]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(getApiUrl("/api/messages"), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();

      // Handle both wrapped and unwrapped responses
      const messagesArray = Array.isArray(data) ? data : data.messages || [];
      setMessages(messagesArray);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]); // Ensure messages is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(getApiUrl("/api/customers"), {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  // Filter and sort messages
  const filteredAndSortedMessages = useMemo(() => {
    let filtered = messages.filter((msg) => {
      // Filter out admin reply messages (type='reply' and from='admin')
      // These should only appear in thread views
      if (msg.type === 'reply' && msg.from === 'admin') {
        return false;
      }

      const matchesStatus =
        statusFilter === "all" || msg.status === statusFilter;
      const fromField = msg.from || msg.email || "";
      const matchesSearch =
        !searchQuery ||
        fromField.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.name &&
          msg.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.orderId && msg.orderId.includes(searchQuery));
      return matchesStatus && matchesSearch;
    });

    // Sort messages
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [messages, searchQuery, statusFilter, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedMessages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMessages = filteredAndSortedMessages.slice(startIndex, endIndex);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleRowClick = async (message) => {
    setSelectedMessage(message);
    setShowModal(true);

    // Fetch the message thread
    try {
      const threadResponse = await fetch(
        getApiUrl(`/api/messages/${message._id}/thread`),
        {
          credentials: "include",
        }
      );

      if (threadResponse.ok) {
        const threadData = await threadResponse.json();
        setMessageThread(threadData.replies || []);
      }
    } catch (error) {
      console.error("Error fetching message thread:", error);
    }

    if (message.status === "unread") {
      try {
        const response = await fetch(
          getApiUrl(`/api/messages/${message._id}`),
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ status: "read" }),
          }
        );

        if (!response.ok) {
          console.error("Failed to update message status");
          return;
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === message._id ? { ...msg, status: "read" } : msg
          )
        );

        // Notify other components about the status change
        window.dispatchEvent(new Event("messageStatusUpdated"));
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    }
  };

  const handleArchive = async (id) => {
    try {
      await fetch(getApiUrl(`/api/messages/${id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: "archived" }),
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === id ? { ...msg, status: "archived" } : msg
        )
      );

      // Notify other components about the status change
      window.dispatchEvent(new Event("messageStatusUpdated"));

      setShowModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error archiving message:", error);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this message? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/messages/${id}`), {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      setMessages((prev) => prev.filter((msg) => msg._id !== id));

      // Notify other components about the status change
      window.dispatchEvent(new Event("messageStatusUpdated"));

      setShowModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message. Please try again.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
    setMessageThread([]);
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(currentMessages.map((msg) => msg._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${
      selectedIds.length
    } message${
      selectedIds.length > 1 ? "s" : ""
    }? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Delete all selected messages
      await Promise.all(
        selectedIds.map((id) =>
          fetch(getApiUrl(`/api/messages/${id}`), {
            method: "DELETE",
            credentials: "include",
          })
        )
      );

      setMessages((prev) =>
        prev.filter((msg) => !selectedIds.includes(msg._id))
      );
      setSelectedIds([]);

      // Notify other components about the status change
      window.dispatchEvent(new Event("messageStatusUpdated"));
    } catch (error) {
      console.error("Error deleting messages:", error);
      alert("Failed to delete some messages. Please try again.");
    }
  };

  const handleComposeClick = () => {
    setReplyTo("");
    setReplySubject("");
    setReplyMessage("");
    setShowReplyModal(true);
  };

  const handleReplyClick = () => {
    if (!selectedMessage) return;

    setReplyTo(selectedMessage.from || selectedMessage.email);
    setReplySubject(`Re: ${selectedMessage.subject}`);
    setReplyMessage("");
    setShowReplyModal(true);
  };

  const handleToInputChange = (e) => {
    const value = e.target.value;
    setReplyTo(value);

    if (value.length > 0) {
      const filtered = customers.filter(
        (customer) =>
          customer.email.toLowerCase().includes(value.toLowerCase()) ||
          (customer.name &&
            customer.name.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(filtered.length > 0);
    } else {
      setShowCustomerDropdown(false);
    }
  };

  const handleCustomerSelect = (customer) => {
    setReplyTo(customer.email);
    setShowCustomerDropdown(false);
  };

  const handleSendEmail = async () => {
    if (!replyTo || !replySubject || !replyMessage) {
      alert("Please fill in recipient, subject, and message");
      return;
    }

    setSendingEmail(true);

    try {
      const response = await fetch(
        getApiUrl("/api/messages/send-email"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            to: replyTo,
            subject: replySubject,
            message: replyMessage,
            originalMessageId: selectedMessage?._id || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      const result = await response.json();

      // If this is a reply to an existing message, refresh the thread
      if (selectedMessage) {
        const threadResponse = await fetch(
          getApiUrl(`/api/messages/${selectedMessage._id}/thread`),
          {
            credentials: "include",
          }
        );
        if (threadResponse.ok) {
          const threadData = await threadResponse.json();
          setMessageThread(threadData.replies || []);
        }
      }

      alert("Email sent successfully!");
      setShowReplyModal(false);
      setReplyTo("");
      setReplySubject("");
      setReplyMessage("");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const closeReplyModal = () => {
    setShowReplyModal(false);
    setReplyTo("");
    setReplySubject("");
    setReplyMessage("");
    setShowCustomerDropdown(false);
  };

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  if (loading) {
    return (
      <div className="admin-messages">
        <div className="loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="admin-messages">
      <div className="messages-container">
        {/* Header */}
        <div className="messages-header">
          <div className="header-top">
            <div>
              <h2>Messages</h2>
              <p className="unread-count">
                {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={handleComposeClick}
              style={{
                minWidth: "160px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px 12px",
                background: "white",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#1a1a1a",
                fontWeight: "500",
                marginLeft: "auto",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "18px" }}
              >
                edit
              </span>
              Compose
            </button>
          </div>

          {/* Filters */}
          <div className="filters">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              className="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="archived">Archived</option>
            </select>
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="btn btn-danger"
              >
                Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="messages-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      currentMessages.length > 0 &&
                      selectedIds.length === currentMessages.length
                    }
                  />
                </th>
                <th className="icon-col"></th>
                <th>
                  <button
                    onClick={() => handleSort("from")}
                    className="btn btn-tertiary btn-sm"
                  >
                    From
                    <span className="material-symbols-outlined">swap_vert</span>
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSort("subject")}
                    className="btn btn-tertiary btn-sm"
                  >
                    Subject
                    <span className="material-symbols-outlined">swap_vert</span>
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="btn btn-tertiary btn-sm"
                  >
                    Date
                    <span className="material-symbols-outlined">swap_vert</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentMessages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-messages">
                    No messages found
                  </td>
                </tr>
              ) : (
                currentMessages.map((message) => (
                  <tr
                    key={message._id}
                    onClick={() => handleRowClick(message)}
                    className={`message-row ${
                      message.status === "unread" ? "unread" : ""
                    }`}
                  >
                    <td
                      className="checkbox-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(message._id)}
                        onChange={() => handleCheckboxChange(message._id)}
                      />
                    </td>
                    <td className="icon-col">
                      {message.status === "unread" ? (
                        <span className="material-symbols-outlined unread-icon">
                          mail
                        </span>
                      ) : (
                        <span className="material-symbols-outlined read-icon">
                          drafts
                        </span>
                      )}
                    </td>
                    <td className="from-col">
                      {message.name || message.from || message.email}
                    </td>
                    <td className="subject-col">{message.subject}</td>
                    <td className="date-col">
                      {new Date(message.createdAt).toLocaleDateString()}{" "}
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAndSortedMessages.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredAndSortedMessages.length)} of{" "}
              {filteredAndSortedMessages.length} messages
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm"
              >
                <span className="material-symbols-outlined">chevron_left</span>
                Previous
              </button>
              <div className="page-info">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {showModal && selectedMessage && (
        <>
          <div className="modal-overlay" onClick={closeModal}></div>
          <div className="message-modal">
            <div className="modal-header">
              <div className="modal-title">
                <h3>{selectedMessage.subject}</h3>
                <span className={`type-badge ${selectedMessage.type}`}>
                  {selectedMessage.type === "order" ? "Order" : "Contact"}
                </span>
              </div>
              <button onClick={closeModal} className="modal-close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-content">
              {/* Original Message */}
              <div className="message-thread">
                <div className="thread-message customer-message">
                  <div className="message-meta">
                    <div className="meta-row">
                      <span className="meta-label">From:</span>{" "}
                      {selectedMessage.from || selectedMessage.email}
                    </div>
                    <div className="meta-row">
                      <span className="meta-label">Date:</span>{" "}
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </div>
                    {selectedMessage.orderId && (
                      <div className="meta-row">
                        <span className="meta-label">Order ID:</span> #
                        {selectedMessage.orderId}
                      </div>
                    )}
                  </div>
                  <div className="message-body">
                    <p>{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Display replies in chronological order */}
                {messageThread.length > 0 && (
                  <div className="thread-replies">
                    {messageThread.map((reply, index) => (
                      <div key={reply._id} className="thread-message admin-reply">
                        <div className="message-meta">
                          <div className="meta-row">
                            <span className="meta-label">From:</span> Admin
                          </div>
                          <div className="meta-row">
                            <span className="meta-label">Date:</span>{" "}
                            {new Date(reply.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="message-body">
                          <p style={{ whiteSpace: "pre-wrap" }}>{reply.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button className="btn btn-primary" onClick={handleReplyClick}>
                  Reply
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleArchive(selectedMessage._id)}
                >
                  Archive
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(selectedMessage._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reply Email Modal */}
      {showReplyModal && (
        <>
          <div className="modal-overlay" onClick={closeReplyModal}></div>
          <div className="message-modal">
            <div className="modal-header">
              <div className="modal-title">
                <h3>
                  {selectedMessage ? "Reply to Message" : "Compose Email"}
                </h3>
              </div>
              <button onClick={closeReplyModal} className="modal-close">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-content">
              <div
                className="form-group"
                style={{ marginBottom: "15px", position: "relative" }}
              >
                <label htmlFor="reply-to">To:</label>
                <input
                  id="reply-to"
                  type="text"
                  value={replyTo}
                  onChange={handleToInputChange}
                  placeholder="Enter email address or search for customer"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    marginTop: "5px",
                  }}
                />
                {showCustomerDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      marginTop: "2px",
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer._id}
                        onClick={() => handleCustomerSelect(customer)}
                        style={{
                          padding: "10px",
                          cursor: "pointer",
                          borderBottom: "1px solid #f0f0f0",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f5f5f5")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "white")
                        }
                      >
                        <div style={{ fontWeight: "500" }}>
                          {customer.name || customer.email}
                        </div>
                        {customer.name && (
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {customer.email}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group" style={{ marginTop: "20px" }}>
                <label htmlFor="reply-subject">Subject:</label>
                <input
                  id="reply-subject"
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    marginTop: "5px",
                  }}
                />
              </div>
              <div className="form-group" style={{ marginTop: "15px" }}>
                <label htmlFor="reply-message">Message:</label>
                <textarea
                  id="reply-message"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={10}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    marginTop: "5px",
                    resize: "vertical",
                  }}
                />
              </div>
              <div className="modal-actions" style={{ marginTop: "20px" }}>
                <button
                  className="btn btn-primary"
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? "Sending..." : "Send Email"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={closeReplyModal}
                  disabled={sendingEmail}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
