#include <stdint.h>
#include <stdio.h>
#include <string.h>
#include <net-snmp/net-snmp-config.h>
#include <net-snmp/net-snmp-includes.h>

int main(int argc, char *argv[]) {
	// Declare variables for SNMP session, PDU, response, and OID
	netsnmp_session session, *ss;
    netsnmp_pdu *pdu;
    netsnmp_pdu *response;
    netsnmp_variable_list *vars;
    oid anOID[MAX_OID_LEN];
    size_t anOID_len = MAX_OID_LEN;
    int status;

    // 1. Initialize the SNMP library
    init_snmp("snmpget_simple");

    // 2. Initialize a "session" that describes default configuration
    snmp_sess_init(&session);
    // ตั้งค่า IP Address ของอุปกรณ์ SNMP (เปลี่ยนตามอุปกรณ์ของคุณ)
    session.peername = strdup("172.16.26.11"); // หรือ "192.168.1.1", "localhost"
    session.version = SNMP_VERSION_2c;      // ใช้ SNMPv2c
    // ตั้งค่า Community String (เปลี่ยนตามอุปกรณ์ของคุณ)
    session.community = (u_char *)"KUWINTEST"; // หรือ "private"
    session.community_len = strlen((const char *)session.community);

    // 3. Open the session
    SOCK_STARTUP; // จำเป็นสำหรับ Windows Sockets
    ss = snmp_open(&session);

    if (!ss) {
        snmp_sess_perror("Error opening SNMP session", &session);
        SOCK_CLEANUP;
        return 1;
    }

    // 4. Create the PDU for the GET request
    pdu = snmp_pdu_create(SNMP_MSG_GET);

    // 5. Parse the OID for System Description (sysDescr.0)
    // OID: 1.3.6.1.2.1.1.1.0 (SNMPv2-MIB::sysDescr.0)
    if (!read_objid("1.3.6.1.2.1.1.5.0", anOID, &anOID_len)) {
        fprintf(stderr, "Error parsing OID.\n");
        snmp_free_pdu(pdu);
        snmp_close(ss);
        SOCK_CLEANUP;
        return 1;
    }

    // 6. Add the OID to the PDU
    snmp_add_null_var(pdu, anOID, anOID_len);

    // 7. Send the request and get the response
    status = snmp_synch_response(ss, pdu, &response);

    // 8. Process the response
    if (status == STAT_SUCCESS && response->errstat == SNMP_ERR_NOERROR) {
        // SUCCESS: Print the results
        for (vars = response->variables; vars; vars = vars->next_variable) {
            printf("OID: ");
            print_objid(vars->name, vars->name_length); // พิมพ์ OID แบบตัวเลข
            printf("\n");
            printf("Value: ");
            // print_variable จะพิมพ์ค่าของตัวแปรตามชนิดข้อมูล
            print_variable(vars->name, vars->name_length, vars);
            printf("\n");
        }
    } else {
        // ERROR: Print error messages
        if (status == STAT_SUCCESS) {
            fprintf(stderr, "Error in packet\nReason: %s\n", snmp_errstring(response->errstat));
        } else if (status == STAT_TIMEOUT) {
            fprintf(stderr, "Timeout: No response from %s.\n", session.peername);
        } else {
            snmp_sess_perror("snmpget_simple", ss);
        }
    }

    // 9. Clean up
    if (response) {
        snmp_free_pdu(response);
    }
    snmp_close(ss);
    SOCK_CLEANUP; // จำเป็นสำหรับ Windows Sockets

    // Free the dynamically allocated peername
    if (session.peername) {
        free(session.peername);
    }
	return 0;
}
