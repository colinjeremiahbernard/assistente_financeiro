#!/usr/bin/env python3
"""
Mock Plaid MCP Server (STDIO)
-----------------------------
Servidor MCP local que simula o mcp-server-plaid com dados fictícios em BRL.
Expõe ferramentas compatíveis com o formato Plaid Sandbox para fins de demonstração.

Uso:
    uv run server.py

Ou como servidor STDIO no seu cliente MCP:
    command: uvx
    args: ["--from", ".", "python", "server.py"]
"""

import json
import sys

# ── Dados fictícios ──────────────────────────────────────────────────────────

ACCOUNTS = [
    {
        "account_id": "acc_checking_001",
        "name": "Conta Corrente",
        "official_name": "Conta Corrente Pessoa Física",
        "type": "depository",
        "subtype": "checking",
        "balances": {
            "available": 4320.50,
            "current": 4320.50,
            "limit": None,
            "iso_currency_code": "BRL",
        },
        "mask": "1234",
    },
    {
        "account_id": "acc_savings_001",
        "name": "Poupança",
        "official_name": "Conta Poupança",
        "type": "depository",
        "subtype": "savings",
        "balances": {
            "available": 12800.00,
            "current": 12800.00,
            "limit": None,
            "iso_currency_code": "BRL",
        },
        "mask": "5678",
    },
    {
        "account_id": "acc_credit_001",
        "name": "Cartão de Crédito",
        "official_name": "Cartão Visa Platinum",
        "type": "credit",
        "subtype": "credit card",
        "balances": {
            "available": 6500.00,
            "current": 1543.75,
            "limit": 8000.00,
            "iso_currency_code": "BRL",
        },
        "mask": "9012",
    },
]

TRANSACTIONS = [
    {"transaction_id": "txn_001", "account_id": "acc_checking_001", "amount": -3200.00, "date": "2025-07-01", "name": "Salário", "merchant_name": None, "category": ["Receita", "Salário"], "payment_channel": "other", "pending": False},
    {"transaction_id": "txn_002", "account_id": "acc_checking_001", "amount": 1800.00, "date": "2025-07-05", "name": "Aluguel", "merchant_name": None, "category": ["Moradia", "Aluguel"], "payment_channel": "other", "pending": False},
    {"transaction_id": "txn_003", "account_id": "acc_checking_001", "amount": 320.00, "date": "2025-07-08", "name": "Supermercado Extra", "merchant_name": "Extra", "category": ["Alimentação", "Supermercado"], "payment_channel": "in store", "pending": False},
    {"transaction_id": "txn_004", "account_id": "acc_checking_001", "amount": 89.90, "date": "2025-07-10", "name": "NET Virtua Internet", "merchant_name": "Claro/NET", "category": ["Utilidades", "Internet"], "payment_channel": "other", "pending": False},
    {"transaction_id": "txn_005", "account_id": "acc_checking_001", "amount": 45.00, "date": "2025-07-12", "name": "Farmácia São João", "merchant_name": "Farmácia São João", "category": ["Saúde", "Farmácia"], "payment_channel": "in store", "pending": False},
    {"transaction_id": "txn_006", "account_id": "acc_checking_001", "amount": -500.00, "date": "2025-07-15", "name": "PIX Recebido – Ana Lima", "merchant_name": None, "category": ["Receita", "Transferência"], "payment_channel": "other", "pending": False},
    {"transaction_id": "txn_007", "account_id": "acc_checking_001", "amount": 180.00, "date": "2025-07-18", "name": "Posto Shell Gasolina", "merchant_name": "Shell", "category": ["Transporte", "Combustível"], "payment_channel": "in store", "pending": False},
    {"transaction_id": "txn_008", "account_id": "acc_checking_001", "amount": 210.50, "date": "2025-07-20", "name": "Supermercado Pão de Açúcar", "merchant_name": "Pão de Açúcar", "category": ["Alimentação", "Supermercado"], "payment_channel": "in store", "pending": False},
    {"transaction_id": "txn_009", "account_id": "acc_checking_001", "amount": 55.00, "date": "2025-07-22", "name": "Restaurante Sabor & Arte", "merchant_name": "Sabor & Arte", "category": ["Alimentação", "Restaurante"], "payment_channel": "in store", "pending": False},
    {"transaction_id": "txn_010", "account_id": "acc_checking_001", "amount": 30.00, "date": "2025-07-25", "name": "iFood Delivery", "merchant_name": "iFood", "category": ["Alimentação", "Delivery"], "payment_channel": "online", "pending": False},
    {"transaction_id": "txn_011", "account_id": "acc_credit_001", "amount": 299.99, "date": "2025-07-03", "name": "Amazon.com.br", "merchant_name": "Amazon", "category": ["Compras", "Online"], "payment_channel": "online", "pending": False},
    {"transaction_id": "txn_012", "account_id": "acc_credit_001", "amount": 39.90, "date": "2025-07-06", "name": "Netflix", "merchant_name": "Netflix", "category": ["Entretenimento", "Streaming"], "payment_channel": "online", "pending": False},
    {"transaction_id": "txn_013", "account_id": "acc_credit_001", "amount": 29.90, "date": "2025-07-06", "name": "Spotify", "merchant_name": "Spotify", "category": ["Entretenimento", "Streaming"], "payment_channel": "online", "pending": False},
    {"transaction_id": "txn_014", "account_id": "acc_credit_001", "amount": 154.00, "date": "2025-07-11", "name": "Renner Roupas", "merchant_name": "Renner", "category": ["Vestuário", "Loja"], "payment_channel": "in store", "pending": False},
    {"transaction_id": "txn_015", "account_id": "acc_credit_001", "amount": 78.50, "date": "2025-07-14", "name": "Rappi Farmácia", "merchant_name": "Rappi", "category": ["Saúde", "Delivery"], "payment_channel": "online", "pending": False},
    {"transaction_id": "txn_016", "account_id": "acc_credit_001", "amount": 320.00, "date": "2025-07-17", "name": "Passagem Aérea LATAM", "merchant_name": "LATAM", "category": ["Viagem", "Passagem"], "payment_channel": "online", "pending": False},
    {"transaction_id": "txn_017", "account_id": "acc_credit_001", "amount": 95.00, "date": "2025-07-19", "name": "Decathlon", "merchant_name": "Decathlon", "category": ["Esporte", "Loja"], "payment_channel": "in store", "pending": False},
    {"transaction_id": "txn_018", "account_id": "acc_credit_001", "amount": 249.99, "date": "2025-07-23", "name": "Americanas.com", "merchant_name": "Americanas", "category": ["Compras", "Online"], "payment_channel": "online", "pending": True},
    {"transaction_id": "txn_019", "account_id": "acc_credit_001", "amount": -200.00, "date": "2025-07-24", "name": "Estorno – Amazon", "merchant_name": "Amazon", "category": ["Estorno", "Compras"], "payment_channel": "online", "pending": False},
    {"transaction_id": "txn_020", "account_id": "acc_savings_001", "amount": -800.00, "date": "2025-07-01", "name": "Rendimento Poupança", "merchant_name": None, "category": ["Receita", "Investimento"], "payment_channel": "other", "pending": False},
]

# ── Ferramentas MCP ──────────────────────────────────────────────────────────

TOOLS = {
    "plaid_accounts_get": {
        "description": "Retorna a lista de contas bancárias fictícias com saldos em BRL.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "account_ids": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "IDs das contas a filtrar (opcional). Se vazio, retorna todas.",
                }
            },
        },
    },
    "plaid_transactions_get": {
        "description": "Retorna transações fictícias. Valor positivo = saída (débito); negativo = entrada (crédito).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "start_date": {"type": "string", "description": "Data inicial YYYY-MM-DD"},
                "end_date": {"type": "string", "description": "Data final YYYY-MM-DD"},
                "account_ids": {"type": "array", "items": {"type": "string"}},
            },
        },
    },
    "plaid_balance_get": {
        "description": "Retorna o saldo atual e disponível de cada conta em BRL.",
        "inputSchema": {"type": "object", "properties": {}},
    },
    "plaid_item_get": {
        "description": "Retorna informações sobre o Item de sandbox (conexão fictícia com a instituição).",
        "inputSchema": {"type": "object", "properties": {}},
    },
}

# ── Execução das ferramentas ─────────────────────────────────────────────────

def execute_tool(name: str, args: dict) -> str:
    if name == "plaid_accounts_get":
        ids = args.get("account_ids", [])
        result = [a for a in ACCOUNTS if not ids or a["account_id"] in ids]
        return json.dumps({"accounts": result, "currency": "BRL", "disclaimer": "Dados fictícios de sandbox"})

    if name == "plaid_transactions_get":
        start = args.get("start_date", "2025-07-01")
        end = args.get("end_date", "2025-07-31")
        ids = args.get("account_ids", [])
        result = [
            t for t in TRANSACTIONS
            if start <= t["date"] <= end and (not ids or t["account_id"] in ids)
        ]
        return json.dumps({
            "transactions": result,
            "total_transactions": len(result),
            "note": "Valor positivo = saída (débito). Valor negativo = entrada (crédito). Dados fictícios.",
        })

    if name == "plaid_balance_get":
        balances = [{"account_id": a["account_id"], "name": a["name"], "balances": a["balances"]} for a in ACCOUNTS]
        return json.dumps({"accounts": balances, "currency": "BRL", "disclaimer": "Dados fictícios de sandbox"})

    if name == "plaid_item_get":
        return json.dumps({
            "item": {
                "item_id": "item_sandbox_001",
                "institution_id": "ins_br_001",
                "institution_name": "Banco Demo (fictício)",
                "status": "UPDATED",
                "webhook": None,
                "error": None,
                "consent_expiration_time": "2026-07-01T00:00:00Z",
            },
            "disclaimer": "Item fictício de sandbox. Em produção, exige consentimento e segurança adicionais.",
        })

    return json.dumps({"error": f"Ferramenta '{name}' não encontrada."})

# ── Protocolo MCP (JSON-RPC 2.0) ─────────────────────────────────────────────

def process_request(req: dict):
    """Processa uma requisição JSON-RPC e devolve a resposta (ou None)."""
    method = req.get("method", "")
    rid = req.get("id")

    if method == "initialize":
        return {
            "jsonrpc": "2.0", "id": rid,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "serverInfo": {"name": "mock-plaid-mcp", "version": "1.0.0"},
            },
        }

    if method == "tools/list":
        tools = [
            {"name": n, "description": m["description"], "inputSchema": m["inputSchema"]}
            for n, m in TOOLS.items()
        ]
        return {"jsonrpc": "2.0", "id": rid, "result": {"tools": tools}}

    if method == "tools/call":
        params = req.get("params", {})
        content = execute_tool(params.get("name", ""), params.get("arguments", {}))
        return {
            "jsonrpc": "2.0", "id": rid,
            "result": {"content": [{"type": "text", "text": content}]},
        }

    if method == "notifications/initialized":
        return None

    if rid is not None:
        return {"jsonrpc": "2.0", "id": rid, "error": {"code": -32601, "message": "Method not found"}}
    return None


# ── Modo STDIO (uso local) ───────────────────────────────────────────────────

def send(obj: dict) -> None:
    sys.stdout.write(json.dumps(obj) + "\n")
    sys.stdout.flush()


def main() -> None:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            resp = process_request(json.loads(line))
            if resp is not None:
                send(resp)
        except json.JSONDecodeError:
            send({"jsonrpc": "2.0", "id": None, "error": {"code": -32700, "message": "Parse error"}})


# ── Modo HTTP (Vercel) ───────────────────────────────────────────────────────

try:
    from flask import Flask, request, jsonify, Response

    app = Flask(__name__)

    @app.after_request
    def add_cors(resp):
        resp.headers["Access-Control-Allow-Origin"] = "*"  # restrinja ao domínio do frontend depois
        resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
        resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        return resp

    @app.get("/")
    def health():
        return jsonify({"status": "ok", "server": "mock-plaid-mcp"})

    @app.route("/mcp", methods=["POST", "OPTIONS"])
    def mcp_http():
        if request.method == "OPTIONS":
            return Response(status=204)
        resp = process_request(request.get_json(force=True, silent=True) or {})
        if resp is None:
            return Response(status=202)
        return jsonify(resp)
except ImportError:
    app = None  # Flask não instalado: só o modo STDIO funciona


if __name__ == "__main__":
    main()

