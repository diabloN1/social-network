package middleware

import (
    "database/sql"
    "net/http"
)

var DB *sql.DB

func CheckGroupMembership(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        userID := r.Context().Value("user_id")
        groupID := r.URL.Query().Get("group_id") 

        if userID == nil || groupID == "" {
            http.Error(w, "Unauthorized: Missing user or group information", http.StatusUnauthorized)
            return
        }

        var isMember bool
        query := `
            SELECT EXISTS(
                SELECT 1 
                FROM group_members 
                WHERE user_id = ? AND group_id = ? AND is_accepted = TRUE
            )`

        err := DB.QueryRow(query, userID, groupID).Scan(&isMember)
        if err != nil || !isMember {
            http.Error(w, "Forbidden: You are not a member of this group", http.StatusForbidden)
            return
        }

        next.ServeHTTP(w, r)
    })
}
